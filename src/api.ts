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
  source?: "github-release" | "repo-folder" | "local-cache" | "manifest";
};

export const DEFAULT_REPO = "mhmdrameez/pos_web_app-spa";
export const DEFAULT_GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "";

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
  const local = localStorage.getItem("qb_gh_token");
  if (local && local.trim()) return local.trim();

  const envToken = import.meta.env.VITE_GITHUB_TOKEN || "";
  if (envToken && envToken.trim()) return envToken.trim();

  return DEFAULT_GITHUB_TOKEN;
}

export function setStoredToken(token: string) {
  localStorage.setItem("qb_gh_token", token.trim());
}

export function clearStoredToken() {
  localStorage.removeItem("qb_gh_token");
}

export function resetToDefaultToken(): string {
  localStorage.removeItem("qb_gh_token");
  return DEFAULT_GITHUB_TOKEN;
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

/**
 * Optimistically saves an uploaded release to local cache and broadcasts an event
 * so that it is IMMEDIATELY visible without waiting for GitHub API propagation.
 */
export function saveOptimisticRelease(release: Release, repo: string = getStoredRepo()): Release[] {
  const cacheKey = `qb_releases_cache_${repo}`;
  let existing: Release[] = [];
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.data)) existing = parsed.data;
    }
  } catch {
    // ignore
  }

  const filtered = existing.filter(
    (r) => r.id !== release.id && r.fileName !== release.fileName && r.version !== release.version
  );
  const updated: Release[] = [
    { ...release, isLatest: true },
    ...filtered.map((r) => ({ ...r, isLatest: false })),
  ];

  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ timestamp: Date.now(), data: updated })
    );
  } catch {
    // ignore
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("qb:releases_updated", { detail: updated }));
  }
  return updated;
}

export function removeCachedRelease(id: string, repo: string = getStoredRepo()) {
  const cacheKey = `qb_releases_cache_${repo}`;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.data)) {
        const remaining = parsed.data.filter((r: Release) => r.id !== id);
        if (remaining.length > 0) remaining[0].isLatest = true;
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: remaining }));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("qb:releases_updated", { detail: remaining }));
        }
      }
    }
  } catch {
    // ignore
  }
}

export async function fetchReleases(forceRefresh = false): Promise<{
  releases: Release[];
  latest: Release | null;
  repo: string;
}> {
  const repo = getStoredRepo();
  const cacheKey = `qb_releases_cache_${repo}`;

  if (forceRefresh) {
    try {
      localStorage.removeItem(cacheKey);
    } catch {
      // ignore
    }
  } else {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        // Only return if cache has non-empty releases and is less than 2 minutes old
        if (Date.now() - timestamp < 2 * 60 * 1000 && Array.isArray(data) && data.length > 0) {
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

  // Fetch in parallel:
  // 1. Formal GitHub releases (/releases)
  // 2. Repository contents of releases/ folder (/contents/releases)
  // 3. Fallback static manifest (/releases.json)
  const [relRes, contentsRes, manifestRes] = await Promise.allSettled([
    fetch(`https://api.github.com/repos/${repo}/releases`, { headers }),
    fetch(`https://api.github.com/repos/${repo}/contents/releases?ref=main`, { headers }),
    fetch(`/releases.json`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
  ]);

  let ghReleases: any[] = [];
  if (relRes.status === "fulfilled" && relRes.value.ok) {
    try {
      ghReleases = await relRes.value.json();
    } catch {
      // ignore
    }
  }

  let folderFiles: any[] = [];
  if (contentsRes.status === "fulfilled" && contentsRes.value.ok) {
    try {
      folderFiles = await contentsRes.value.json();
    } catch {
      // ignore
    }
  }

  let staticManifest: Release[] = [];
  if (manifestRes.status === "fulfilled" && Array.isArray(manifestRes.value)) {
    staticManifest = manifestRes.value;
  }

  const fileMap = new Map<string, any>();
  if (Array.isArray(folderFiles)) {
    for (const f of folderFiles) {
      if (f.name && f.name.toLowerCase().endsWith(".apk")) {
        fileMap.set(f.name, f);
      }
    }
  }

  const releases: Release[] = [];
  const processedFiles = new Set<string>();

  // 1. Process GitHub releases
  if (Array.isArray(ghReleases)) {
    for (const r of ghReleases) {
      const apkAsset =
        r.assets?.find((a: any) => a.name?.toLowerCase().endsWith(".apk")) ||
        r.assets?.[0];

      const version = r.tag_name || r.name || "unknown";
      let sizeBytes = apkAsset?.size || 0;
      let downloadUrl = apkAsset?.browser_download_url;
      let fileName = apkAsset ? apkAsset.name : "";

      // Check if release body has markdown APK link
      if (!fileName && r.body) {
        const match =
          r.body.match(/\[([a-zA-Z0-9._-]+\.apk)\]\((https:\/\/github\.com\/[^/]+\/[^/]+\/raw\/[^\s)]+\.apk)\)/i) ||
          r.body.match(/(https:\/\/github\.com\/[^/]+\/[^/]+\/raw\/[^\s)]+\/([a-zA-Z0-9._-]+\.apk))/i);
        if (match) {
          if (match[2] && match[2].endsWith(".apk")) {
            downloadUrl = match[2];
            fileName = match[1];
          } else if (match[1] && match[2]) {
            downloadUrl = match[1];
            fileName = match[2];
          }
        }
      }

      if (!fileName && r.body) {
        const rawMatch = r.body.match(/https:\/\/(raw\.githubusercontent\.com|github\.com)\/[^\s)]+\.apk/i);
        if (rawMatch) {
          downloadUrl = rawMatch[0];
          const parts = downloadUrl.split("/");
          fileName = decodeURIComponent(parts[parts.length - 1]);
        }
      }

      // If fileName matches a file in the releases/ directory, link exact file size
      if (fileName && fileMap.has(fileName)) {
        const folderFile = fileMap.get(fileName);
        if (!sizeBytes && folderFile.size) sizeBytes = folderFile.size;
        processedFiles.add(fileName);
      }

      // Parse approximate size from body if still missing
      if (!sizeBytes && r.body) {
        const sizeMatch = r.body.match(/\(([\d.]+)\s*(MB|KB|GB|B)\)/i);
        if (sizeMatch) {
          const val = parseFloat(sizeMatch[1]);
          const unit = sizeMatch[2].toUpperCase();
          if (unit === "MB") sizeBytes = Math.round(val * 1024 * 1024);
          else if (unit === "KB") sizeBytes = Math.round(val * 1024);
        }
      }

      if (!downloadUrl) downloadUrl = r.html_url;
      if (!fileName) fileName = `${version}.apk`;

      releases.push({
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
        isLatest: releases.length === 0,
        source: "github-release",
      });
    }
  }

  // 2. Add any APK files found in repo releases/ folder that weren't in a formal GitHub release
  for (const [name, f] of fileMap.entries()) {
    if (!processedFiles.has(name)) {
      const buildMatch = name.match(/release__(\d+)_/i) || name.match(/build[_-]?(\d+)/i);
      const verMatch = name.match(/v?(\d+\.\d+(\.\d+)?)/i);
      let ver = "v1.0.0";
      let title = `QuickBill POS ${name.replace(/\.apk$/i, "")}`;
      if (buildMatch) {
        ver = `v1.0.0 (Build ${buildMatch[1]})`;
        title = `QuickBill POS Build ${buildMatch[1]}`;
      } else if (verMatch) {
        ver = verMatch[1].startsWith("v") ? verMatch[1] : `v${verMatch[1]}`;
        title = `QuickBill POS ${ver}`;
      }

      releases.push({
        id: `folder-${name.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
        version: ver,
        title,
        notes: `Build available directly in repository releases/ folder (${name})`,
        fileName: name,
        sizeBytes: f.size || 0,
        sizeLabel: formatBytes(f.size || 0),
        uploadedAt: new Date().toISOString(),
        downloadUrl: `https://raw.githubusercontent.com/${repo}/main/releases/${name}`,
        htmlUrl: `https://github.com/${repo}/blob/main/releases/${name}`,
        author: repo.split("/")[0] || "developer",
        isLatest: releases.length === 0,
        source: "repo-folder",
      });
    }
  }

  // 3. If releases is still empty or GitHub API failed/rate-limited, merge static manifest
  if (releases.length === 0 && staticManifest.length > 0) {
    for (const item of staticManifest) {
      releases.push({
        ...item,
        source: "manifest",
      });
    }
  }

  // Also retain any recently optimistic releases in cache if not yet returned by GitHub
  const cachedRaw = localStorage.getItem(cacheKey);
  if (cachedRaw) {
    try {
      const { data } = JSON.parse(cachedRaw);
      if (Array.isArray(data)) {
        for (const localRel of data) {
          const exists = releases.some(
            (r) => r.fileName === localRel.fileName || r.id === localRel.id
          );
          if (!exists) {
            releases.unshift(localRel);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Deduplicate releases by unique fileName and id
  const seenIds = new Set<string>();
  const seenFiles = new Set<string>();
  const uniqueReleases: Release[] = [];

  for (const rel of releases) {
    if (seenIds.has(rel.id) || seenFiles.has(rel.fileName)) continue;
    seenIds.add(rel.id);
    seenFiles.add(rel.fileName);
    uniqueReleases.push(rel);
  }

  // If we found any releases, update cache and latest flag
  if (uniqueReleases.length > 0) {
    uniqueReleases[0].isLatest = true;
    for (let i = 1; i < uniqueReleases.length; i++) uniqueReleases[i].isLatest = false;

    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data: uniqueReleases })
      );
    } catch {
      // ignore
    }

    return {
      releases: uniqueReleases,
      latest: uniqueReleases[0] || null,
      repo,
    };
  }

  // If both GitHub requests had errors and no releases were found:
  if (relRes.status === "rejected" || (relRes.status === "fulfilled" && !relRes.value.ok)) {
    const errorText =
      relRes.status === "rejected"
        ? relRes.reason?.message
        : `GitHub API status ${relRes.value?.status}`;
    throw new Error(`Failed to load releases: ${errorText || "Network error"}`);
  }

  return {
    releases: [],
    latest: null,
    repo,
  };
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
        let errMessage = `GitHub API error (${xhr.status})`;
        let detailParts: string[] = [];

        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.message) {
            errMessage = errData.message;
          }
          if (Array.isArray(errData.errors) && errData.errors.length > 0) {
            const list = errData.errors
              .map((e: any) => (typeof e === "string" ? e : (e.message || e.code || JSON.stringify(e))))
              .join("\n• ");
            detailParts.push(`Details:\n• ${list}`);
          }
          if (errData.documentation_url) {
            detailParts.push(`Documentation: ${errData.documentation_url}`);
          }
        } catch {
          if (xhr.responseText) {
            detailParts.push(xhr.responseText.slice(0, 500));
          }
        }

        let fullError = errMessage;
        if (detailParts.length > 0) {
          fullError += `\n\n${detailParts.join("\n\n")}`;
        }

        // Add helpful operational guidance based on status
        if (xhr.status === 401) {
          // If a custom token was stored in localStorage, remove it so it doesn't block future requests
          localStorage.removeItem("qb_gh_token");
          fullError = `401 Unauthorized: Invalid or expired GitHub Personal Access Token.\n\n${fullError}\n\nThe custom token has been reset. Please click 'Publish APK' again to use the default repository token, or enter a valid GitHub Token with 'repo' scope in Token Settings.`;
        } else if (xhr.status === 403) {
          fullError = `403 Forbidden: Permission denied or GitHub repository protection blocked the push.\n\n${fullError}\n\nEnsure your token has 'repo' or 'contents:write' scope and branch protection allows direct pushes.`;
        } else if (xhr.status === 404) {
          fullError = `404 Not Found: Repository was not found or your token cannot access it. Check that the repository name is correct.`;
        } else if (xhr.status === 409) {
          fullError = `409 Conflict: Commit SHA mismatch or concurrent update on GitHub.\n\n${fullError}`;
        } else if (xhr.status === 413) {
          fullError = `413 Payload Too Large: This APK file exceeds the GitHub Contents API single-file limit (100 MB).`;
        } else if (xhr.status === 422) {
          fullError = `422 Unprocessable Entity / Push Rejected:\n\n${fullError}`;
        }

        reject(new Error(fullError));
      }
    };

    xhr.onerror = () => reject(new Error("Network connection error: Failed to communicate with api.github.com. Check your internet connection or browser security filters."));
    xhr.ontimeout = () => reject(new Error("Upload timed out: GitHub API took too long to respond. Please try again."));

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
  notes: string = "",
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

  const releaseBody = notes?.trim()
    ? `${notes.trim()}\n\n---\n📦 **APK Download:** [${safeName}](${rawDownloadUrl}) (${formatBytes(file.size)})\n*Build uploaded via QuickBill POS*`
    : `📦 **APK Download:** [${safeName}](${rawDownloadUrl}) (${formatBytes(file.size)})\n*Build uploaded via QuickBill POS*`;

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
    source: "github-release",
  };

  // Optimistically persist in cache so it shows IMMEDIATELY everywhere
  saveOptimisticRelease(createdRelease, repo);

  return { release: createdRelease, rawUrl: rawDownloadUrl };
}

export async function deleteGitHubRelease(id: string, token: string, repo: string = getStoredRepo()) {
  if (!id.startsWith("folder-") && !id.startsWith("file-")) {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok && res.status !== 204 && res.status !== 404) {
      let detail = "";
      try {
        const errJson = await res.json();
        detail = errJson.message || "";
      } catch {
        // ignore
      }
      throw new Error(`Failed to delete release on GitHub (${res.status}): ${detail || res.statusText}`);
    }
  }
  removeCachedRelease(id, repo);
  return true;
}

export function getGithubNewReleaseUrl(version: string, title: string, notes: string): string {
  const repo = getStoredRepo();
  const tag = version ? (version.startsWith("v") ? version : `v${version}`) : "v1.0.0";
  const releaseTitle = title || `QuickBillPoss ${tag}`;
  return `https://github.com/${repo}/releases/new?tag=${encodeURIComponent(tag)}&title=${encodeURIComponent(releaseTitle)}&body=${encodeURIComponent(notes)}`;
}
