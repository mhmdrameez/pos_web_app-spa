export type Release = {
  id: string;
  version: string;
  notes: string;
  fileName: string;
  sizeBytes: number;
  sizeLabel: string;
  uploadedAt: string;
  downloadUrl: string;
};

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function normalizeRelease(r: Release): Release {
  if (!r) return r;
  return {
    ...r,
    downloadUrl:
      API_BASE && r.downloadUrl && r.downloadUrl.startsWith("/")
        ? `${API_BASE}${r.downloadUrl}`
        : r.downloadUrl,
  };
}

async function parseJson(input: Response | Promise<Response>) {
  const res = await input;
  const contentType = res.headers.get("content-type") || "";
  let data: any = {};
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => ({}));
  } else {
    await res.text().catch(() => "");
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        "API endpoint not found (404). Backend server is not running on Vercel. See setup instructions to connect your backend."
      );
    }
    if (res.status === 413) {
      throw new Error("File too large (413). Upload size exceeded limit.");
    }
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchReleases(): Promise<{ releases: Release[]; latest: Release | null }> {
  const data = await parseJson(fetch(`${API_BASE}/api/releases`));
  return {
    releases: (data.releases || []).map(normalizeRelease),
    latest: data.latest ? normalizeRelease(data.latest) : null,
  };
}

export function fetchMe() {
  return parseJson(fetch(`${API_BASE}/api/me`, { credentials: "include" }));
}

export function login(userId: string, password: string) {
  return parseJson(
    fetch(`${API_BASE}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    })
  );
}

export function logout() {
  return parseJson(fetch(`${API_BASE}/api/logout`, { method: "POST", credentials: "include" }));
}

export async function uploadRelease(form: FormData) {
  const data = await parseJson(
    fetch(`${API_BASE}/api/releases`, {
      method: "POST",
      credentials: "include",
      body: form,
    })
  );
  if (data.release) data.release = normalizeRelease(data.release);
  return data;
}

export function deleteRelease(id: string) {
  return parseJson(
    fetch(`${API_BASE}/api/releases/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
  );
}

