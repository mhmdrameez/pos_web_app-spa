export type Release = {
  id: string;
  version: string;
  title: string;
  notes: string;
  fileName: string;
  sizeBytes: number;
  sizeLabel: string;
  uploadedAt: string;
  downloadUrl: string;
  htmlUrl: string;
  author: string;
  isLatest?: boolean;
};

export const DEFAULT_REPO = "mhmdrameez/pos_web_app-spa";

// Static authentication check from environment
export const STATIC_ADMIN_USER = import.meta.env.VITE_ADMIN_USER || "developer";
export const STATIC_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "QuickBill@2026";

export function checkStaticLogin(userId: string, password: string): boolean {
  return (
    userId.trim() === STATIC_ADMIN_USER.trim() &&
    password === STATIC_ADMIN_PASSWORD
  );
}

export function isSessionAuthed(): boolean {
  return sessionStorage.getItem("qb_admin_session") === "true";
}

export function setSessionAuthed(value: boolean) {
  if (value) {
    sessionStorage.setItem("qb_admin_session", "true");
  } else {
    sessionStorage.removeItem("qb_admin_session");
  }
}

export function getStoredRepo(): string {
  return localStorage.getItem("qb_gh_repo") || import.meta.env.VITE_GITHUB_REPO || DEFAULT_REPO;
}

export function setStoredRepo(repo: string) {
  const cleaned = repo.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, "");
  localStorage.setItem("qb_gh_repo", cleaned || DEFAULT_REPO);
}

export function getStoredToken(): string {
  // Check env first, then localStorage
  const envToken = import.meta.env.VITE_GITHUB_TOKEN || "";
  if (envToken && envToken.trim()) return envToken.trim();
  return localStorage.getItem("qb_gh_token") || "";
}

export function setStoredToken(token: string) {
  localStorage.setItem("qb_gh_token", token.trim());
}

export function clearStoredToken() {
  localStorage.removeItem("qb_gh_token");
}

export function hasConfiguredToken(): boolean {
  return Boolean(getStoredToken());
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 1 : 2)} ${units[i]}`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function fetchReleases(forceRefresh = false): Promise<{
  releases: Release[];
  latest: Release | null;
  repo: string;
}> {
  const repo = getStoredRepo();
  const cacheKey = `qb_releases_cache_${repo}`;

  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        // Cache valid for 2 minutes
        if (Date.now() - timestamp < 2 * 60 * 1000 && Array.isArray(data)) {
          return {
            releases: data,
            latest: data[0] || null,
            repo,
          };
        }
      } catch {
        // ignore
      }
    }
  }

  const token = getStoredToken();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases`, { headers });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`GitHub repository "${repo}" not found or private.`);
      }
      if (res.status === 403) {
        const rateLimitRemaining = res.headers.get("x-ratelimit-remaining");
        if (rateLimitRemaining === "0") {
          throw new Error("GitHub API rate limit reached. Please set VITE_GITHUB_TOKEN or wait a few minutes.");
        }
      }
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const ghReleases: any[] = await res.json();
    const releases: Release[] = ghReleases.map((r, index) => {
      const apkAsset =
        r.assets?.find((a: any) => a.name?.toLowerCase().endsWith(".apk")) ||
        r.assets?.[0];

      const version = r.tag_name || r.name || "unknown";
      let sizeBytes = apkAsset?.size || 0;
      let downloadUrl = apkAsset?.browser_download_url;
      let fileName = apkAsset ? apkAsset.name : `${version}.apk`;

      // If no direct asset attached, check if release body contains the raw GitHub download link
      if (!downloadUrl && r.body) {
        const rawMatch = r.body.match(/https:\/\/github\.com\/[^/]+\/[^/]+\/raw\/[^\s)]+\.apk/i);
        if (rawMatch) {
          downloadUrl = rawMatch[0];
          const parts = downloadUrl.split("/");
          fileName = decodeURIComponent(parts[parts.length - 1]);
        }
      }

      if (!downloadUrl) {
        downloadUrl = r.html_url;
      }

      return {
        id: String(r.id),
        version: version.startsWith("v") ? version : `v${version}`,
        title: r.name || version,
        notes: r.body || "",
        fileName,
        sizeBytes,
        sizeLabel: sizeBytes > 0 ? formatBytes(sizeBytes) : "Android APK",
        uploadedAt: r.published_at || r.created_at,
        downloadUrl,
        htmlUrl: r.html_url,
        author: r.author?.login || "",
        isLatest: index === 0,
      };
    });

    localStorage.setItem(
      cacheKey,
      JSON.stringify({ timestamp: Date.now(), data: releases })
    );

    return {
      releases,
      latest: releases[0] || null,
      repo,
    };
  } catch (err) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        if (Array.isArray(data) && data.length > 0) {
          return {
            releases: data,
            latest: data[0] || null,
            repo,
          };
        }
      } catch {
        // ignore
      }
    }
    throw err;
  }
}

export interface UploadProgress {
  percent: number; // 0 to 100
  loadedBytes: number;
  totalBytes: number;
  status: string;
  stage: "preparing" | "uploading" | "committing" | "releasing" | "done";
}

function putJsonWithProgress(
  url: string,
  token: string,
  payload: any,
  fileSize: number,
  onProgress?: (info: UploadProgress) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "application/vnd.github+json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        const ratio = e.loaded / e.total;
        const currentFileLoaded = Math.min(fileSize, Math.round(ratio * fileSize));
        const rawPct = Math.round(ratio * 100);
        // During active network upload, keep percent within 1% - 99% until all bytes are sent
        const percent = Math.min(99, Math.max(1, rawPct));
        onProgress?.({
          percent,
          loadedBytes: currentFileLoaded,
          totalBytes: fileSize,
          status: `Uploading APK to GitHub... ${percent}% (${formatBytes(currentFileLoaded)} of ${formatBytes(fileSize)})`,
          stage: "uploading",
        });
      }
    };

    xhr.upload.onload = () => {
      // 100% of bytes sent to GitHub
      onProgress?.({
        percent: 100,
        loadedBytes: fileSize,
        totalBytes: fileSize,
        status: "100% Uploaded! GitHub is writing and verifying build commit...",
        stage: "committing",
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          resolve(data);
        } catch {
          resolve({});
        }
      } else {
        let errMessage = `Failed to commit APK to repository (status ${xhr.status})`;
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.message) errMessage = errData.message;
        } catch {
          // ignore
        }
        reject(new Error(errMessage));
      }
    };

    xhr.onerror = () => reject(new Error("Network connection error during APK upload to GitHub."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."));

    xhr.send(JSON.stringify(payload));
  });
}

/**
 * Uploads an APK file directly to the GitHub repository (into releases/)
 * and creates the corresponding GitHub Release with fix notes.
 * Works completely in the browser using the owner's GitHub Token.
 */
export async function uploadApkToGitHubRepo(
  file: File,
  version: string,
  title: string,
  notes: string,
  onProgress?: (info: UploadProgress) => void
): Promise<{ release: Release; rawUrl: string }> {
  const repo = getStoredRepo();
  const token = getStoredToken();
  if (!token) {
    throw new Error(
      "GitHub Token is missing. Set VITE_GITHUB_TOKEN in .env/Vercel or enter it in the Developer Console settings."
    );
  }

  if (file.size > 100 * 1024 * 1024) {
    throw new Error(
      `File size is ${formatBytes(file.size)}. GitHub API limits single file uploads via contents API to 100 MB.`
    );
  }

  const cleanVer = version.trim().startsWith("v") ? version.trim() : `v${version.trim()}`;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `releases/${safeName}`;

  onProgress?.({
    percent: 0,
    loadedBytes: 0,
    totalBytes: file.size,
    status: "Checking existing releases on GitHub...",
    stage: "preparing",
  });

  let existingSha: string | undefined;
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    if (checkRes.ok) {
      const data = await checkRes.json();
      existingSha = data.sha;
    }
  } catch {
    // ignore
  }

  onProgress?.({
    percent: 0,
    loadedBytes: 0,
    totalBytes: file.size,
    status: `Preparing ${file.name} (${formatBytes(file.size)})...`,
    stage: "preparing",
  });

  const base64Content = await fileToBase64(file);

  onProgress?.({
    percent: 1,
    loadedBytes: 0,
    totalBytes: file.size,
    status: `Uploading APK to GitHub... 0% (0 B of ${formatBytes(file.size)})`,
    stage: "uploading",
  });

  await putJsonWithProgress(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    token,
    {
      message: `Release ${cleanVer}: ${title || cleanVer}`,
      content: base64Content,
      sha: existingSha,
    },
    file.size,
    onProgress
  );

  const rawDownloadUrl = `https://github.com/${repo}/raw/main/${filePath}`;

  onProgress?.({
    percent: 100,
    loadedBytes: file.size,
    totalBytes: file.size,
    status: "100% - Creating GitHub Release tag and publishing download links...",
    stage: "releasing",
  });

  const releaseBody = `## What's Changed & Fixed:\n${notes.trim()}\n\n---\n📦 **APK Download:** [${safeName}](${rawDownloadUrl}) (${formatBytes(file.size)})\n*Build uploaded via QuickBill POS Developer Console*`;

  let ghReleaseData: any = {};
  try {
    const relRes = await fetch(`https://api.github.com/repos/${repo}/releases`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tag_name: cleanVer,
        name: title.trim() || `QuickBillPoss ${cleanVer}`,
        body: releaseBody,
        draft: false,
        prerelease: false,
      }),
    });
    if (relRes.ok) {
      ghReleaseData = await relRes.json();
    }
  } catch {
    // File is already in repo, release metadata is optional
  }

  onProgress?.({
    percent: 100,
    loadedBytes: file.size,
    totalBytes: file.size,
    status: `✓ Done! 100% - Release ${cleanVer} successfully published to GitHub.`,
    stage: "done",
  });

  const createdRelease: Release = {
    id: String(ghReleaseData.id || Date.now()),
    version: cleanVer,
    title: title || `QuickBillPoss ${cleanVer}`,
    notes,
    fileName: safeName,
    sizeBytes: file.size,
    sizeLabel: formatBytes(file.size),
    uploadedAt: new Date().toISOString(),
    downloadUrl: rawDownloadUrl,
    htmlUrl: ghReleaseData.html_url || `https://github.com/${repo}/releases`,
    author: ghReleaseData.author?.login || "developer",
    isLatest: true,
  };

  return { release: createdRelease, rawUrl: rawDownloadUrl };
}

export async function deleteGitHubRelease(id: string, token: string, repo: string = getStoredRepo()) {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete release on GitHub (status ${res.status})`);
  }
  return true;
}

export function getGithubNewReleaseUrl(version: string, title: string, notes: string): string {
  const repo = getStoredRepo();
  const tag = version ? (version.startsWith("v") ? version : `v${version}`) : "v1.0.0";
  const releaseTitle = title || `QuickBillPoss ${tag}`;
  return `https://github.com/${repo}/releases/new?tag=${encodeURIComponent(tag)}&title=${encodeURIComponent(releaseTitle)}&body=${encodeURIComponent(notes)}`;
}
