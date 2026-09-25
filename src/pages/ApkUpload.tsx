import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteRelease,
  fetchMe,
  fetchReleases,
  login,
  logout,
  uploadRelease,
  type Release,
} from "../api";

function formatBytes(bytes: number) {
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

export default function ApkUpload() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [releases, setReleases] = useState<Release[]>([]);
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const sizeLabel = useMemo(() => (file ? formatBytes(file.size) : ""), [file]);

  async function loadReleases() {
    const data = await fetchReleases();
    setReleases(data.releases || []);
  }

  useEffect(() => {
    fetchMe()
      .then((me) => setAuthed(Boolean(me.authenticated)))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (authed) loadReleases().catch((e) => setError(e.message));
  }, [authed]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(userId, password);
      setAuthed(true);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await logout();
    setAuthed(false);
  }

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!file) {
      setError("Choose an APK file");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("version", version);
      form.append("notes", notes);
      form.append("apk", file);
      await uploadRelease(form);
      setNotice(`Uploaded ${version} (${formatBytes(file.size)}). It is now the latest release on the homepage.`);
      setVersion("");
      setNotes("");
      setFile(null);
      await loadReleases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string, versionLabel: string) {
    if (!confirm(`Remove release ${versionLabel}?`)) return;
    setError("");
    try {
      await deleteRelease(id);
      await loadReleases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    }
  }

  if (checking) {
    return (
      <div className="login-page">
        <div className="login-card">Checking session…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={onLogin}>
          <Link to="/" className="brand" style={{ marginBottom: 18 }}>
            <span className="logo">Q</span>
            QuickBill POS
          </Link>
          <h2 style={{ margin: "8px 0 6px" }}>Developer sign in</h2>
          <p className="lede" style={{ fontSize: 14, margin: "0 0 8px" }}>
            Upload App-POS APK releases. Only signed-in developers can publish a build.
          </p>
          {error ? <div className="err">{error}</div> : null}
          <label htmlFor="userId">User ID</label>
          <input
            id="userId"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="developer"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="lede" style={{ fontSize: 13, marginTop: 16 }}>
            <Link to="/">Back to marketing site</Link>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="login-page" style={{ alignItems: "start", paddingTop: 40 }}>
      <div className="console">
        <div className="row">
          <div>
            <Link to="/" className="brand">
              <span className="logo">Q</span>
              QuickBill POS
            </Link>
            <h2 style={{ margin: "12px 0 4px" }}>APK release console</h2>
            <p className="lede" style={{ fontSize: 14, margin: 0 }}>
              Each upload becomes the latest download on the public SPA.
            </p>
          </div>
          <button className="btn btn-outline" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>

        {error ? <div className="err" style={{ marginTop: 16 }}>{error}</div> : null}
        {notice ? <div className="ok" style={{ marginTop: 16 }}>{notice}</div> : null}

        <form onSubmit={onUpload} style={{ marginTop: 18 }}>
          <label htmlFor="version">Release version</label>
          <input
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.4"
            required
          />
          <label htmlFor="notes">Release notes</label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Thermal print fix, faster SQLite open…"
          />
          <label>APK file</label>
          <div className="drop">
            <input
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="size-preview">
              {file
                ? `${file.name} · download size ${sizeLabel}`
                : "Size is calculated from the file before and after upload."}
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} disabled={busy}>
            {busy ? "Uploading…" : "Upload APK"}
          </button>
        </form>

        <h3 style={{ marginTop: 32 }}>Published releases</h3>
        {releases.length === 0 ? (
          <p className="lede" style={{ fontSize: 14 }}>No APKs yet. Upload the first build above.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>File</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {releases.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.version}</strong>
                    {i === 0 ? " · latest" : ""}
                    {r.notes ? <div style={{ color: "#5b6b80" }}>{r.notes}</div> : null}
                  </td>
                  <td>{r.sizeLabel}</td>
                  <td>{new Date(r.uploadedAt).toLocaleString()}</td>
                  <td>
                    <a href={r.downloadUrl}>{r.fileName}</a>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => onDelete(r.id, r.version)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
