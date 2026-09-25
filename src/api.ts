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

async function parseJson(input: Response | Promise<Response>) {
  const res = await input;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function fetchReleases() {
  return parseJson(fetch("/api/releases"));
}

export function fetchMe() {
  return parseJson(fetch("/api/me", { credentials: "include" }));
}

export function login(userId: string, password: string) {
  return parseJson(
    fetch("/api/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    })
  );
}

export function logout() {
  return parseJson(fetch("/api/logout", { method: "POST", credentials: "include" }));
}

export function uploadRelease(form: FormData) {
  return parseJson(
    fetch("/api/releases", {
      method: "POST",
      credentials: "include",
      body: form,
    })
  );
}

export function deleteRelease(id: string) {
  return parseJson(
    fetch(`/api/releases/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
  );
}
