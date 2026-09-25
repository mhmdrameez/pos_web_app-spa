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

export function getStoredRepo(): string {
  return localStorage.getItem("qb_gh_repo") || import.meta.env.VITE_GITHUB_REPO || DEFAULT_REPO;
}

export function setStoredRepo(repo: string) {
  const cleaned = repo.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, "");
  localStorage.setItem("qb_gh_repo", cleaned || DEFAULT_REPO);
}

export function getStoredToken(): string {
  return localStorage.getItem("qb_gh_token") || "";
}

export function setStoredToken(token: string) {
  localStorage.setItem("qb_gh_token", token.trim());
}

export function clearStoredToken() {
  localStorage.removeItem("qb_gh_token");
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

export async function fetchReleases(forceRefresh = false): Promise<{
  releases: Release[];
  latest: Release | null;
  repo: string;
  source: "github" | "cache" | "fallback";
}> {
  const repo = getStoredRepo();
  const cacheKey = `qb_releases_cache_${repo}`;

  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        // Cache valid for 3 minutes
        if (Date.now() - timestamp < 3 * 60 * 1000 && Array.isArray(data)) {
          return {
            releases: data,
            latest: data[0] || null,
            repo,
            source: "cache",
          };
        }
      } catch {
        // ignore parse error
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
          throw new Error("GitHub API rate limit exceeded. Please wait a few minutes or add a GitHub Personal Access Token.");
        }
      }
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const ghReleases: any[] = await res.json();
    const releases: Release[] = ghReleases.map((r, index) => {
      // Find .apk asset or first asset
      const apkAsset =
        r.assets?.find((a: any) => a.name?.toLowerCase().endsWith(".apk")) ||
        r.assets?.[0];

      const version = r.tag_name || r.name || "unknown";
      const sizeBytes = apkAsset?.size || 0;

      return {
        id: String(r.id),
        version: version.startsWith("v") ? version : `v${version}`,
        title: r.name || version,
        notes: r.body || "",
        fileName: apkAsset ? apkAsset.name : `${version}.apk`,
        sizeBytes,
        sizeLabel: sizeBytes > 0 ? formatBytes(sizeBytes) : "GitHub build",
        uploadedAt: r.published_at || r.created_at,
        downloadUrl: apkAsset?.browser_download_url || r.html_url,
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
      source: "github",
    };
  } catch (err) {
    // If request failed (e.g. rate limit / network error), try to return cached data
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        if (Array.isArray(data) && data.length > 0) {
          return {
            releases: data,
            latest: data[0] || null,
            repo,
            source: "cache",
          };
        }
      } catch {
        // ignore
      }
    }
    throw err;
  }
}

export async function fetchCurrentUser(token: string): Promise<{
  username: string;
  name: string;
  avatarUrl: string;
}> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "Invalid GitHub Personal Access Token. Please check token permissions."
        : `GitHub authentication failed (${res.status})`
    );
  }
  const data = await res.json();
  return {
    username: data.login,
    name: data.name || data.login,
    avatarUrl: data.avatar_url,
  };
}

export async function createGitHubRelease(
  version: string,
  title: string,
  notes: string,
  token: string,
  repo: string = getStoredRepo()
): Promise<{ id: string; htmlUrl: string; uploadUrl: string }> {
  const cleanTag = version.trim().startsWith("v") ? version.trim() : `v${version.trim()}`;
  const res = await fetch(`https://api.github.com/repos/${repo}/releases`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tag_name: cleanTag,
      name: title.trim() || `QuickBillPoss ${cleanTag}`,
      body: notes.trim(),
      draft: false,
      prerelease: false,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 422) {
      throw new Error(`Release or tag "${cleanTag}" already exists on GitHub.`);
    }
    throw new Error(errorData.message || `Failed to create release (status ${res.status})`);
  }

  const data = await res.json();
  return {
    id: String(data.id),
    htmlUrl: data.html_url,
    uploadUrl: data.upload_url,
  };
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
