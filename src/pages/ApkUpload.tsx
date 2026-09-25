import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  checkStaticLogin,
  clearStoredToken,
  deleteGitHubRelease,
  fetchReleases,
  formatBytes,
  getStoredRepo,
  getStoredToken,
  hasConfiguredToken,
  isSessionAuthed,
  resetToDefaultToken,
  setSessionAuthed,
  setStoredToken,
  uploadApkToGitHubRepo,
  type Release,
  type UploadProgress,
} from "../api";

export default function ApkUpload() {
  const [authed, setAuthed] = useState(isSessionAuthed());
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);
  const repo = getStoredRepo();

  // GitHub token state
  const [token, setTokenState] = useState(getStoredToken());
  const [showTokenConfig, setShowTokenConfig] = useState(false);
  const [customToken, setCustomToken] = useState("");

  // Release form state
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // Status messages
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const sizeLabel = useMemo(() => (file ? formatBytes(file.size) : ""), [file]);

  async function loadData(force = false) {
    setError("");
    try {
      if (force) setRefreshing(true);
      const data = await fetchReleases(force);
      setReleases(data.releases || []);
    } catch (err: any) {
      setError(err.message || "Failed to load releases from GitHub");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (authed) {
      loadData();
    }
  }, [authed]);

  useEffect(() => {
    function handleUpdate(e: any) {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setReleases(e.detail);
      }
    }
    window.addEventListener("qb:releases_updated", handleUpdate);
    return () => window.removeEventListener("qb:releases_updated", handleUpdate);
  }, []);

  function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (checkStaticLogin(userId, password)) {
      setSessionAuthed(true);
      setAuthed(true);
      setPassword("");
    } else {
      setError("Invalid User Name or Password. Default username is 'developer'.");
    }
  }

  function onLogout() {
    setSessionAuthed(false);
    setAuthed(false);
    setUserId("");
    setPassword("");
    setNotice("");
    setError("");
  }

  function handleSaveToken(e: FormEvent) {
    e.preventDefault();
    if (customToken.trim()) {
      setStoredToken(customToken.trim());
      setTokenState(customToken.trim());
      setNotice("Personal Access Token saved!");
    } else {
      clearStoredToken();
      setTokenState(resetToDefaultToken());
      setNotice("Using default repository token.");
    }
    setShowTokenConfig(false);
    setCustomToken("");
  }

  function handleResetToken() {
    clearStoredToken();
    setTokenState(resetToDefaultToken());
    setError("");
    setNotice("Token reset to default repository token.");
    setShowTokenConfig(false);
    setCustomToken("");
  }

  async function onDirectUpload(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");

    const curToken = getStoredToken();
    if (!curToken || curToken.trim().length < 10) {
      setError("To publish APKs in Incognito mode or a fresh browser session, please enter your GitHub Personal Access Token (with 'repo' scope) in 'Token Settings' below.");
      setShowTokenConfig(true);
      return;
    }

    if (!file) {
      setError("Please select an APK file to upload.");
      return;
    }

    if (!version.trim()) {
      setError("Please specify a release version (e.g. 1.0.2).");
      return;
    }

    setBusy(true);
    setUploadProgress({
      percent: 0,
      loadedBytes: 0,
      totalBytes: file.size,
      status: `Connecting to GitHub repository ${repo}...`,
      stage: "preparing",
    });

    try {
      const result = await uploadApkToGitHubRepo(
        file,
        version,
        title,
        "",
        (progressInfo) => {
          setUploadProgress(progressInfo);
        }
      );

      // Immediately show uploaded release
      setReleases((prev) => {
        const remaining = prev.filter(
          (r) => r.fileName !== result.release.fileName && r.id !== result.release.id
        );
        return [result.release, ...remaining.map((r) => ({ ...r, isLatest: false }))];
      });

      setNotice(`✓ Release ${result.release.version} (${result.release.sizeLabel}) published successfully!`);
      setVersion("");
      setTitle("");
      setFile(null);
      setUploadProgress(null);

      // Refresh list from GitHub
      await loadData(true);
    } catch (err: any) {
      setError(err.message || "Failed to upload APK to GitHub");
      setUploadProgress(null);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string, ver: string) {
    const curToken = getStoredToken();
    if (!curToken) {
      alert("GitHub Token is required to delete releases.");
      setShowTokenConfig(true);
      return;
    }
    if (!confirm(`Delete release ${ver}? This cannot be undone.`)) return;

    setError("");
    try {
      setReleases((prev) => {
        const remaining = prev.filter((r) => r.id !== id);
        if (remaining.length > 0) remaining[0].isLatest = true;
        return remaining;
      });
      await deleteGitHubRelease(id, curToken, repo);
      setNotice(`Deleted release ${ver}.`);
      await loadData(true);
    } catch (err: any) {
      setError(err.message || "Failed to delete release");
    }
  }

  // 1. Clean Mobile-Friendly Login View
  if (!authed) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={onLogin} style={{ maxWidth: 420 }}>
          <Link to="/" className="brand" style={{ marginBottom: 16 }}>
            <img src="/logo.svg" className="logo" alt="QuickBill POS" width={36} height={36} />
            QuickBill POS
          </Link>
          <h2 style={{ margin: "4px 0 6px", fontSize: 22 }}>Admin Sign In</h2>
          <p className="lede" style={{ fontSize: 14, margin: "0 0 16px" }}>
            Sign in to upload and manage QuickBill POS APK releases.
          </p>

          {error ? (
            <div className="err" style={{ marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          ) : null}

          <label htmlFor="userId">User Name</label>
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
            placeholder="••••••••••••"
            required
          />

          <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }}>
            Sign In
          </button>

          <p className="lede" style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>
            <Link to="/">← Back to homepage</Link>
          </p>
        </form>
      </div>
    );
  }

  // 2. Simple, Responsive Admin Panel
  return (
    <div className="login-page" style={{ alignItems: "start", paddingTop: 24, paddingBottom: 60 }}>
      <div className="console" style={{ width: "min(920px, 100%)" }}>
        
        {/* Responsive Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            borderBottom: "1px solid var(--line)",
            paddingBottom: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/" className="brand">
              <img src="/logo.svg" className="logo" alt="QuickBill POS" width={36} height={36} />
              QuickBill POS
            </Link>
            <span
              style={{
                background: "#dbeafe",
                color: "#1d4ed8",
                fontSize: 12,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
              }}
            >
              Admin Panel
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <a
              className="btn btn-outline"
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "7px 12px", fontSize: 13 }}
            >
              🌐 Web POS ↗
            </a>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || busy}
              style={{ padding: "7px 12px", fontSize: 13 }}
              title="Refresh releases list"
            >
              {refreshing ? "Refreshing…" : "↻ Refresh"}
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={onLogout}
              style={{ padding: "7px 12px", fontSize: 13 }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Clean Status Strip */}
        <div
          style={{
            padding: "10px 14px",
            background: "#f8fafc",
            border: "1px solid var(--line)",
            borderRadius: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "var(--muted)" }}>Repo:</span>
            <a
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 700, color: "var(--blue)" }}
            >
              {repo}
            </a>
            <span style={{ color: "#16a34a", fontWeight: 600 }}>• Active</span>
            {hasConfiguredToken() ? (
              <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                ✓ Token Ready
              </span>
            ) : (
              <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                ⚠️ Token Needed for Upload
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowTokenConfig(!showTokenConfig)}
            style={{
              background: "none",
              border: "none",
              color: "var(--blue)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {showTokenConfig ? "Hide Token" : "Token Settings"}
          </button>
        </div>

        {/* Token Config Modal / Dropdown */}
        {showTokenConfig && (
          <form
            onSubmit={handleSaveToken}
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 12,
              padding: "14px",
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: "#92400e", marginBottom: 4 }}>
              GitHub Token Configuration
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#78350f" }}>
              Required to commit & publish APK releases directly to GitHub. In Incognito mode or a fresh session, paste your Personal Access Token (classic) with <code>repo</code> scope below:
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="password"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="Paste Personal Access Token"
                style={{ flex: "1 1 200px" }}
              />
              <button className="btn btn-primary" type="submit" style={{ padding: "8px 14px", fontSize: 13 }}>
                Save Token
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={handleResetToken}
                style={{ padding: "8px 12px", fontSize: 13 }}
              >
                Clear
              </button>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=QuickBill+POS+APK+Upload"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "var(--blue)", textDecoration: "underline", marginLeft: 4 }}
              >
                Generate Token on GitHub ↗
              </a>
            </div>
          </form>
        )}

        {/* Error Alert */}
        {error && (
          <div className="err" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span>⚠️ {error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                style={{ background: "none", border: "none", color: "#991b1b", cursor: "pointer", fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
            {(error.includes("401") || error.toLowerCase().includes("token")) && (
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResetToken}
                  style={{ padding: "6px 12px", fontSize: 12, background: "#dc2626" }}
                >
                  🔄 Reset Token to Working Default
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success Notice */}
        {notice && (
          <div className="ok" style={{ marginBottom: 16 }}>
            {notice}
          </div>
        )}

        {/* Simplified Upload Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "20px",
            marginBottom: 28,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <h3 style={{ margin: "0 0 14px", fontSize: 18 }}>Upload New APK</h3>

          <form onSubmit={onDirectUpload}>
            <div className="form-row-2" style={{ marginBottom: 14 }}>
              <div>
                <label htmlFor="version" style={{ margin: "0 0 4px" }}>
                  Version *
                </label>
                <input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.0.2"
                  required
                />
              </div>
              <div>
                <label htmlFor="title" style={{ margin: "0 0 4px" }}>
                  Title (Optional)
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. QuickBillPOS 1.0.2"
                />
              </div>
            </div>

            <label style={{ margin: "0 0 4px" }}>Select APK File *</label>
            <div className="drop" style={{ padding: "16px", marginBottom: 16 }}>
              <input
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (f && !version) {
                    const m = f.name.match(/(\d+\.\d+(\.\d+)?)/);
                    if (m) setVersion(m[1]);
                  }
                }}
              />
              <div className="size-preview" style={{ fontSize: 13, marginTop: 6 }}>
                {file ? `✓ ${file.name} (${sizeLabel})` : "Tap or drop APK build file here"}
              </div>
            </div>

            {/* Upload Progress Bar */}
            {busy && uploadProgress && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
                  <span>{uploadProgress.status || "Uploading to GitHub..."}</span>
                  <strong>{uploadProgress.percent}%</strong>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 8,
                    background: "#e2e8f0",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress.percent}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px 20px", fontSize: 15 }}
              disabled={busy}
            >
              {busy ? "Uploading APK…" : "🚀 Upload & Publish APK"}
            </button>
          </form>
        </div>

        {/* Clean Published APK Releases List */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>
              Published APKs ({releases.length})
            </h3>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || busy}
              style={{ padding: "5px 10px", fontSize: 12 }}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Loading releases…
            </div>
          ) : releases.length === 0 ? (
            <div
              style={{
                background: "#f8fafc",
                border: "1px dashed var(--line)",
                borderRadius: 14,
                padding: "24px",
                textAlign: "center",
                fontSize: 14,
                color: "var(--muted)",
              }}
            >
              No APK releases published yet. Use the form above to upload your first build!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {releases.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ minWidth: 200, flex: "1 1 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)" }}>
                        {r.version}
                      </span>
                      {i === 0 && (
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: 999,
                          }}
                        >
                          LATEST
                        </span>
                      )}
                      <span style={{ color: "var(--muted)", fontSize: 12.5 }}>
                        {r.sizeLabel} · {new Date(r.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink)", marginTop: 2, wordBreak: "break-all" }}>
                      {r.fileName}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <a
                      className="btn btn-primary"
                      href={r.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "7px 14px", fontSize: 13 }}
                    >
                      Download
                    </a>
                    {r.htmlUrl && (
                      <a
                        className="btn btn-outline"
                        href={r.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: "7px 12px", fontSize: 13 }}
                      >
                        GitHub ↗
                      </a>
                    )}
                    {hasConfiguredToken() && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDelete(r.id, r.version)}
                        style={{ padding: "7px 12px", fontSize: 13 }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
