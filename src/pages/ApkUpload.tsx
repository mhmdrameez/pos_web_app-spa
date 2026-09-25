import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  checkStaticLogin,
  clearStoredToken,
  deleteGitHubRelease,
  fetchReleases,
  formatBytes,
  getGithubNewReleaseUrl,
  getStoredRepo,
  getStoredToken,
  hasConfiguredToken,
  isSessionAuthed,
  setSessionAuthed,
  setStoredRepo,
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
  const [repo, setRepo] = useState(getStoredRepo());
  const [isEditingRepo, setIsEditingRepo] = useState(false);
  const [tempRepo, setTempRepo] = useState(repo);

  // GitHub token state
  const [token, setTokenState] = useState(getStoredToken());
  const [showTokenConfig, setShowTokenConfig] = useState(false);
  const [customToken, setCustomToken] = useState("");

  // Release form state
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");
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

  // Static Login Handler
  function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (checkStaticLogin(userId, password)) {
      setSessionAuthed(true);
      setAuthed(true);
      setPassword("");
    } else {
      setError("Invalid User ID or Password. Check your environment settings.");
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

  function handleSaveRepo(e: FormEvent) {
    e.preventDefault();
    setStoredRepo(tempRepo);
    setRepo(getStoredRepo());
    setIsEditingRepo(false);
    loadData(true);
  }

  function handleSaveToken(e: FormEvent) {
    e.preventDefault();
    if (customToken.trim()) {
      setStoredToken(customToken.trim());
      setTokenState(customToken.trim());
      setNotice("GitHub Personal Access Token saved!");
    } else {
      clearStoredToken();
      setTokenState("");
      setNotice("Token cleared.");
    }
    setShowTokenConfig(false);
    setCustomToken("");
  }

  // Upload APK directly to GitHub Repo + Publish Release
  async function onDirectUpload(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!file) {
      setError("Please select an APK file to upload.");
      return;
    }

    if (!version.trim()) {
      setError("Please specify a release version (e.g. 1.0.4).");
      return;
    }

    if (!hasConfiguredToken()) {
      setError("GitHub Personal Access Token is required to commit files to the repository. Please configure it below.");
      setShowTokenConfig(true);
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
        notes,
        (progressInfo) => {
          setUploadProgress(progressInfo);
          setProgressStatus(progressInfo.status);
        }
      );

      setNotice(`✓ Release ${result.release.version} (${result.release.sizeLabel}) successfully published to GitHub!`);
      setVersion("");
      setTitle("");
      setNotes("");
      setFile(null);
      // Show complete 100% status for 4 seconds then gracefully clear
      setTimeout(() => {
        setUploadProgress(null);
        setProgressStatus("");
      }, 4000);
      await loadData(true);
    } catch (err: any) {
      setError(err.message || "Failed to upload APK to GitHub");
      setUploadProgress(null);
      setProgressStatus("");
    } finally {
      setBusy(false);
    }
  }

  // Fallback 1-Click GitHub Web Publisher
  function onOneClickWebPublish() {
    setError("");
    setNotice("");
    if (!version.trim()) {
      setError("Please specify a release version (e.g. 1.0.4)");
      return;
    }
    const cleanVer = version.trim().startsWith("v") ? version.trim() : `v${version.trim()}`;
    const releaseTitle = title.trim() || `QuickBillPoss ${cleanVer}`;
    const fullNotes = notes.trim()
      ? `## What's Changed & Fixed:\n${notes.trim()}\n\n---\n*Build released via QuickBill POS Developer Console*`
      : `*Build released via QuickBill POS Developer Console*`;

    const ghUrl = getGithubNewReleaseUrl(cleanVer, releaseTitle, fullNotes);
    window.open(ghUrl, "_blank");
    setNotice(`GitHub release page opened! Drop your APK file into GitHub and click "Publish release".`);
  }

  async function onDelete(id: string, ver: string) {
    const curToken = getStoredToken();
    if (!curToken) {
      alert("GitHub Token is required to delete releases.");
      setShowTokenConfig(true);
      return;
    }
    if (!confirm(`Delete release ${ver} from GitHub? This cannot be undone.`)) return;

    setError("");
    try {
      await deleteGitHubRelease(id, curToken, repo);
      setNotice(`Deleted release ${ver} from GitHub.`);
      await loadData(true);
    } catch (err: any) {
      setError(err.message || "Failed to delete release");
    }
  }

  // 1. Static Login View
  if (!authed) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={onLogin}>
          <Link to="/" className="brand" style={{ marginBottom: 18 }}>
            <img src="/logo.svg" className="logo" alt="QuickBill POS" width={36} height={36} />
            QuickBill POS
          </Link>
          <h2 style={{ margin: "8px 0 6px" }}>Developer Sign In</h2>
          <p className="lede" style={{ fontSize: 14, margin: "0 0 12px" }}>
            Upload App-POS APK releases directly to GitHub repository without needing GitHub owner permission.
          </p>

          {error ? (
            <div
              className="err"
              style={{
                marginBottom: 14,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.5,
              }}
            >
              ⚠️ {error}
            </div>
          ) : null}

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
            placeholder="••••••••••••"
            required
          />

          <button className="btn btn-primary" style={{ width: "100%", marginTop: 20 }}>
            Sign In to Release Console
          </button>

          <p className="lede" style={{ fontSize: 13, marginTop: 16 }}>
            <Link to="/">← Back to marketing site</Link>
          </p>
        </form>
      </div>
    );
  }

  // 2. Authenticated Release Console
  return (
    <div className="login-page" style={{ alignItems: "start", paddingTop: 32, paddingBottom: 60 }}>
      <div className="console" style={{ width: "min(1080px, 100%)" }}>
        {/* Top Header */}
        <div className="row" style={{ flexWrap: "wrap", gap: 14 }}>
          <div>
            <Link to="/" className="brand">
              <img src="/logo.svg" className="logo" alt="QuickBill POS" width={36} height={36} />
              QuickBill POS
            </Link>
            <h2 style={{ margin: "10px 0 4px", fontSize: 26 }}>APK Release Console</h2>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <a
              className="btn btn-outline"
              href="https://posquickbill.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              title="Visit live Point of Sale web application"
            >
              🌐 Visit Web App ↗
            </a>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || busy}
              title="Fetch latest releases from GitHub"
            >
              {refreshing ? "Refreshing…" : "↻ Refresh from GitHub"}
            </button>
            <button className="btn btn-outline" type="button" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Status / Repo Bar */}
        <div
          style={{
            margin: "18px 0 14px",
            padding: "12px 18px",
            background: "#f0f6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, color: "var(--navy)" }}>Repository:</span>
            {isEditingRepo ? (
              <form onSubmit={handleSaveRepo} style={{ display: "inline-flex", gap: 6 }}>
                <input
                  value={tempRepo}
                  onChange={(e) => setTempRepo(e.target.value)}
                  placeholder="owner/repo"
                  style={{ padding: "4px 8px", fontSize: 13, width: 220 }}
                />
                <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 12 }}>
                  Save
                </button>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => setIsEditingRepo(false)}
                  style={{ padding: "4px 10px", fontSize: 12 }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <a
                  href={`https://github.com/${repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 800, color: "var(--blue)", textDecoration: "underline" }}
                >
                  {repo}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setTempRepo(repo);
                    setIsEditingRepo(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    fontSize: 12,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  (change)
                </button>
              </>
            )}

            <span style={{ color: "#94a3b8" }}>|</span>

            {/* Token Status Badge */}
            {hasConfiguredToken() ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#15803d",
                  background: "#dcfce7",
                  padding: "3px 10px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ✓ GitHub Token Connected (Owner permissions active)
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowTokenConfig(true)}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#b45309",
                  background: "#fef3c7",
                  padding: "3px 10px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ⚠ GitHub Token Not Set (Click to configure)
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => setShowTokenConfig(!showTokenConfig)}
              style={{
                background: "none",
                border: "none",
                color: "var(--navy)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {showTokenConfig ? "Hide Token Settings" : "Configure GitHub Token"}
            </button>
            <a
              href={`https://github.com/${repo}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--navy)", fontWeight: 600 }}
            >
              View on GitHub ↗
            </a>
          </div>
        </div>

        {/* Optional Token Config Panel */}
        {showTokenConfig ? (
          <form
            onSubmit={handleSaveToken}
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 16,
            }}
          >
            <h4 style={{ margin: "0 0 6px", fontSize: 15, color: "#92400e" }}>
              Configure GitHub Personal Access Token (PAT)
            </h4>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#78350f" }}>
              When set in <code>.env</code> (as <code>VITE_GITHUB_TOKEN</code>) or here, anyone with the developer login can upload APKs directly to the repository without needing owner permission.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="password"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder={hasConfiguredToken() ? "•••••••••••••••••••••••• (Token currently set)" : "ghp_xxxxxxxxxxxxxxxxxxxx"}
                style={{ flex: 1, minWidth: 260 }}
              />
              <button className="btn btn-primary" type="submit" style={{ padding: "8px 18px", fontSize: 13 }}>
                Save Token
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => setShowTokenConfig(false)}
                style={{ padding: "8px 14px", fontSize: 13 }}
              >
                Close
              </button>
            </div>
          </form>
        ) : null}

        {error ? (
          <div
            className="err"
            style={{
              marginBottom: 16,
              padding: "16px 18px",
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 14,
              boxShadow: "0 6px 18px rgba(220, 38, 38, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ color: "#991b1b", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                ⚠️ Error Details:
              </strong>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(error)}
                  className="btn btn-outline"
                  style={{ padding: "3px 10px", fontSize: 12, borderColor: "#fca5a5", color: "#991b1b" }}
                  title="Copy full error to clipboard"
                >
                  📋 Copy Error
                </button>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="btn btn-outline"
                  style={{ padding: "3px 10px", fontSize: 12, borderColor: "#fca5a5", color: "#991b1b" }}
                  title="Dismiss this error"
                >
                  ✕ Dismiss
                </button>
              </div>
            </div>
            <div
              style={{
                color: "#7f1d1d",
                fontSize: 13,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "rgba(254, 226, 226, 0.5)",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #fecaca",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {error}
            </div>
          </div>
        ) : null}
        {notice ? <div className="ok" style={{ marginBottom: 14 }}>{notice}</div> : null}

        {/* Release Publisher Form */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--line)",
            borderRadius: 20,
            padding: "24px",
            marginTop: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>Upload APK &amp; Publish Release</h3>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                background: "#e0f2fe",
                color: "#0369a1",
                padding: "4px 12px",
                borderRadius: 999,
              }}
            >
              Direct to GitHub Repository
            </span>
          </div>

          <form onSubmit={onDirectUpload}>
            <div className="form-row-2">
              <div>
                <label htmlFor="version">Release Version *</label>
                <input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.0.4 or v1.0.4"
                  required
                />
              </div>
              <div>
                <label htmlFor="title">Release Title</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. QuickBillPoss 1.0.4 — Thermal Receipt & Offline Fixes"
                />
              </div>
            </div>

            <label htmlFor="notes" style={{ marginTop: 14 }}>
              What's Fixed in this Build (Release Notes / Changelog) *
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={"• Fixed ESC/POS thermal receipt formatting and disconnect issue\n• Fixed offline cart hold and resume\n• Optimized SQLite local invoice query speed\n• Added support for new Bluetooth printer models"}
              style={{ fontFamily: "inherit" }}
              required
            />
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 12px" }}>
              These fix notes will be published with the release and displayed on the public homepage.
            </p>

            <label>Select Android APK File *</label>
            <div className="drop" style={{ padding: "20px" }}>
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
              <div className="size-preview" style={{ marginTop: 8 }}>
                {file
                  ? `✓ Selected: ${file.name} (${sizeLabel}) · Ready to upload to GitHub`
                  : "Choose an APK to upload. File will be sent directly to GitHub repository releases."}
              </div>
            </div>

            {/* Real-time Upload Progress Indicator */}
            {(busy || uploadProgress) && (
              <div
                style={{
                  marginTop: 18,
                  padding: "16px 20px",
                  background: uploadProgress?.percent === 100 ? "#f0fdf4" : "#f8fafc",
                  border: uploadProgress?.percent === 100 ? "1px solid #86efac" : "1px solid #bfdbfe",
                  borderRadius: 16,
                  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "all 0.3s ease",
                }}
              >
                {/* Header row with status & percentage badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span
                      className="dot"
                      style={{
                        background: uploadProgress?.percent === 100 ? "#16a34a" : "#2563eb",
                        boxShadow:
                          uploadProgress?.percent === 100
                            ? "0 0 0 4px #bbf7d0"
                            : "0 0 0 4px #dbeafe",
                        animation: uploadProgress?.percent === 100 ? "none" : "pulse 1s infinite",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: uploadProgress?.percent === 100 ? "#15803d" : "var(--ink)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {uploadProgress?.status || progressStatus || "Uploading APK to GitHub..."}
                    </span>
                  </div>

                  {/* Percentage badge */}
                  <span
                    style={{
                      padding: "4px 14px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.02em",
                      background: uploadProgress?.percent === 100 ? "#dcfce7" : "#dbeafe",
                      color: uploadProgress?.percent === 100 ? "#15803d" : "#1d4ed8",
                      border: uploadProgress?.percent === 100 ? "1px solid #bbf7d0" : "1px solid #bfdbfe",
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {uploadProgress?.percent ?? 0}%
                    {uploadProgress?.percent === 100 ? " ✓" : ""}
                  </span>
                </div>

                {/* Progress Bar Track & Fill */}
                <div
                  style={{
                    width: "100%",
                    height: 12,
                    background: "#e2e8f0",
                    borderRadius: 999,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress?.percent ?? 0}%`,
                      height: "100%",
                      background:
                        uploadProgress?.percent === 100
                          ? "linear-gradient(90deg, #22c55e, #16a34a)"
                          : "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                      borderRadius: 999,
                      transition: "width 0.22s ease-out",
                      boxShadow:
                        uploadProgress?.percent === 100
                          ? "0 0 12px rgba(34, 197, 94, 0.45)"
                          : "0 0 12px rgba(29, 78, 216, 0.45)",
                    }}
                  />
                </div>

                {/* Bottom row: Bytes progress & real-time badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 12.5,
                    color: "var(--muted)",
                  }}
                >
                  <span>
                    {uploadProgress?.loadedBytes && uploadProgress?.totalBytes
                      ? `${formatBytes(uploadProgress.loadedBytes)} / ${formatBytes(uploadProgress.totalBytes)} uploaded`
                      : file
                      ? `${formatBytes(file.size)} total`
                      : ""}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {uploadProgress?.percent === 100
                      ? "✨ 100% Ready on GitHub"
                      : uploadProgress?.stage === "uploading"
                      ? "📡 Real-time Uploading…"
                      : "⚡ Syncing to GitHub Releases"}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "12px 26px" }}
                disabled={busy}
              >
                {busy ? "Uploading to GitHub…" : "🚀 Upload APK & Publish to GitHub"}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={onOneClickWebPublish}
                disabled={busy}
                title="Open GitHub Release Creator"
              >
                Open in GitHub Web
              </button>
            </div>
          </form>
        </div>

        {/* Published Releases Section */}
        <div style={{ marginTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>
              Live Releases on GitHub ({releases.length})
            </h3>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || busy}
              style={{ fontSize: 13, padding: "6px 12px" }}
            >
              ↻ Sync Now
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 30, textAlign: "center", color: "var(--muted)" }}>
              Loading releases from GitHub…
            </div>
          ) : releases.length === 0 ? (
            <div
              style={{
                background: "#f8fafc",
                border: "1px dashed var(--line)",
                borderRadius: 16,
                padding: "32px",
                textAlign: "center",
              }}
            >
              <h4 style={{ margin: "0 0 6px" }}>No Releases Found on GitHub</h4>
              <p className="lede" style={{ fontSize: 14, margin: "0 0 16px" }}>
                Repository <code>{repo}</code> does not have any published releases yet. Upload your first APK build using the form above!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {releases.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 16,
                    padding: "18px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>
                          {r.version}
                        </span>
                        {i === 0 ? (
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#15803d",
                              fontSize: 11,
                              fontWeight: 800,
                              padding: "2px 8px",
                              borderRadius: 999,
                            }}
                          >
                            LATEST LIVE
                          </span>
                        ) : null}
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>
                          {r.sizeLabel} · {new Date(r.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginTop: 4 }}>{r.title}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <a
                        className="btn btn-primary"
                        href={r.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: "8px 14px", fontSize: 13 }}
                      >
                        Download APK
                      </a>
                      <a
                        className="btn btn-outline"
                        href={r.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: "8px 14px", fontSize: 13 }}
                      >
                        View on GitHub ↗
                      </a>
                      {hasConfiguredToken() ? (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => onDelete(r.id, r.version)}
                          style={{ padding: "8px 12px", fontSize: 13 }}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Fixes and Changelog */}
                  {r.notes ? (
                    <div
                      style={{
                        marginTop: 12,
                        background: "#f8fbff",
                        border: "1px solid #dbeafe",
                        borderRadius: 10,
                        padding: "10px 14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#1d4ed8",
                          marginBottom: 4,
                        }}
                      >
                        What's Fixed in this Build:
                      </div>
                      <div
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          whiteSpace: "pre-line",
                          color: "#334155",
                        }}
                      >
                        {r.notes}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
