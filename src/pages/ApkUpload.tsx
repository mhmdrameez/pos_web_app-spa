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
import SEO from "../components/SEO";

export default function ApkUpload() {
  const [authed, setAuthed] = useState(isSessionAuthed());
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
  const [isDragOver, setIsDragOver] = useState(false);
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

  // 1. Executive Login View
  if (!authed) {
    return (
      <div className="login-page">
        <SEO
          title="Admin Console Sign In — QuickBill POS"
          description="Administrator authentication for QuickBill POS APK distribution management."
          canonicalPath="/apk-upload"
        />

        <form className="login-card" onSubmit={onLogin} style={{ maxWidth: 440 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Link to="/" className="brand">
              <img src="/logo.svg" className="logo" alt="QuickBill POS" width={36} height={36} />
              QuickBill POS
            </Link>
            <span className="brand-badge">Admin Portal</span>
          </div>

          <h2 style={{ margin: "4px 0 6px", fontSize: 24, letterSpacing: "-0.02em" }}>
            Release Manager
          </h2>
          <p className="lede" style={{ fontSize: 14, margin: "0 0 18px", color: "var(--muted)" }}>
            Authenticate to upload, tag, and manage Android APK builds.
          </p>

          {error ? (
            <div className="err" style={{ marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          ) : null}

          <div style={{ marginBottom: 12 }}>
            <label htmlFor="userId">Username</label>
            <input
              id="userId"
              autoComplete="username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="developer"
              required
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 12,
                  color: "var(--primary)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          {/* Default Credentials Help Pill */}
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "12px",
              color: "#1e40af",
              marginBottom: 18,
            }}
          >
            <strong>Default Access:</strong> Username: <code>developer</code> · Password: <code>QuickBill@2026</code>
          </div>

          <button className="btn btn-primary" style={{ width: "100%", padding: "12px 20px" }}>
            Sign In to Console →
          </button>

          <p style={{ fontSize: 13, marginTop: 18, textAlign: "center", color: "var(--muted)" }}>
            <Link to="/" style={{ color: "var(--primary)", fontWeight: 600 }}>
              ← Return to homepage
            </Link>
          </p>
        </form>
      </div>
    );
  }

  // 2. Logged-in Console View
  return (
    <div className="login-page" style={{ alignItems: "start", padding: "28px 16px" }}>
      <SEO
        title="Admin Release Console — QuickBill POS"
        description="Administrator console to upload and publish QuickBill POS Android APK releases."
        canonicalPath="/apk-upload"
      />

      <div className="console">
        {/* Console Header Bar */}
        <div className="row" style={{ marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link to="/" className="brand">
              <img src="/logo.svg" className="logo" alt="QuickBill POS" width={34} height={34} />
              QuickBill POS
            </Link>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--primary)",
                background: "var(--primary-subtle)",
                padding: "3px 9px",
                borderRadius: 999,
              }}
            >
              Admin Console
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
            padding: "12px 16px",
            background: "#f8fafc",
            border: "1px solid var(--line)",
            borderRadius: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "var(--muted)" }}>Target Repo:</span>
            <a
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 700, color: "var(--primary)" }}
            >
              {repo}
            </a>
            <span style={{ color: "#16a34a", fontWeight: 700 }}>• Active Sync</span>
            {hasConfiguredToken() ? (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                ✓ GitHub Token Ready
              </span>
            ) : (
              <span
                style={{
                  background: "#fef3c7",
                  color: "#b45309",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
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
              color: "var(--primary)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {showTokenConfig ? "Hide Token Settings" : "Configure Token"}
          </button>
        </div>

        {/* Token Config Modal / Dropdown */}
        {showTokenConfig && (
          <form
            onSubmit={handleSaveToken}
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 14,
              padding: "16px",
              marginBottom: 20,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#92400e", marginBottom: 4 }}>
              GitHub Token Configuration
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#78350f", lineHeight: 1.5 }}>
              Required to commit & publish APK releases directly to GitHub. In Incognito mode or a fresh session, paste your Personal Access Token (classic) with <code>repo</code> scope below:
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="password"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="Paste Personal Access Token"
                style={{ flex: "1 1 220px" }}
              />
              <button className="btn btn-primary" type="submit" style={{ padding: "8px 16px", fontSize: 13 }}>
                Save Token
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={handleResetToken}
                style={{ padding: "8px 12px", fontSize: 13 }}
              >
                Reset Default
              </button>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=QuickBill+POS+APK+Upload"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12.5, color: "var(--primary)", textDecoration: "underline", marginLeft: 4 }}
              >
                Generate Token on GitHub ↗
              </a>
            </div>
          </form>
        )}

        {/* Error Alert */}
        {error && (
          <div className="err" style={{ marginBottom: 20 }}>
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
          </div>
        )}

        {/* Success Notice */}
        {notice && (
          <div className="ok" style={{ marginBottom: 20 }}>
            {notice}
          </div>
        )}

        {/* Upload New APK Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--line)",
            borderRadius: 18,
            padding: "24px",
            marginBottom: 28,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 22 }}>🚀</span>
            <h3 style={{ margin: 0, fontSize: 19 }}>Upload & Publish New APK</h3>
          </div>

          <form onSubmit={onDirectUpload}>
            <div className="form-row-2" style={{ marginBottom: 14 }}>
              <div>
                <label htmlFor="version" style={{ margin: "0 0 6px" }}>
                  Release Version *
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
                <label htmlFor="title" style={{ margin: "0 0 6px" }}>
                  Release Title (Optional)
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. QuickBillPoss v1.0.2 Stable"
                />
              </div>
            </div>

            <label style={{ margin: "0 0 6px" }}>APK Build File *</label>
            <div
              className={`drop ${isDragOver ? "drop-highlight" : ""}`}
              style={{ padding: "24px", marginBottom: 18 }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) {
                  setFile(droppedFile);
                  if (!version) {
                    const m = droppedFile.name.match(/(\d+\.\d+(\.\d+)?)/);
                    if (m) setVersion(m[1]);
                  }
                }
              }}
            >
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
              <div className="size-preview" style={{ fontSize: 14, marginTop: 8 }}>
                {file ? `✓ ${file.name} (${sizeLabel})` : "Drop APK package here or click to browse files"}
              </div>
            </div>

            {/* Upload Progress Bar */}
            {busy && uploadProgress && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span>{uploadProgress.status || "Uploading to GitHub repository..."}</span>
                  <strong>{uploadProgress.percent}%</strong>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 9,
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
              style={{ width: "100%", padding: "12px 24px", fontSize: 15 }}
              disabled={busy}
            >
              {busy ? "Uploading and publishing APK…" : "Publish APK Release to GitHub →"}
            </button>
          </form>
        </div>

        {/* Published APK Releases Section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 19 }}>
              Published Releases ({releases.length})
            </h3>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || busy}
              style={{ padding: "6px 12px", fontSize: 13 }}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Loading releases…
            </div>
          ) : releases.length === 0 ? (
            <div
              style={{
                background: "#f8fafc",
                border: "1px dashed var(--line)",
                borderRadius: 16,
                padding: "28px",
                textAlign: "center",
                fontSize: 14,
                color: "var(--muted)",
              }}
            >
              No APK releases published yet. Use the form above to deploy your first build!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {releases.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 14,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ minWidth: 220, flex: "1 1 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: "var(--navy)" }}>
                        {r.version}
                      </span>
                      {i === 0 && (
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: 999,
                          }}
                        >
                          LATEST ACTIVE
                        </span>
                      )}
                      <span style={{ color: "var(--muted)", fontSize: 13 }}>
                        {r.sizeLabel} · {new Date(r.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 13.5, color: "var(--ink)", marginTop: 4, wordBreak: "break-all" }}>
                      {r.fileName}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <a
                      className="btn btn-primary"
                      href={r.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "8px 16px", fontSize: 13.5 }}
                    >
                      Download ({r.sizeLabel})
                    </a>
                    {r.htmlUrl && (
                      <a
                        className="btn btn-outline"
                        href={r.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: "8px 14px", fontSize: 13.5 }}
                      >
                        GitHub ↗
                      </a>
                    )}
                    {hasConfiguredToken() && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDelete(r.id, r.version)}
                        style={{ padding: "8px 14px", fontSize: 13.5 }}
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
