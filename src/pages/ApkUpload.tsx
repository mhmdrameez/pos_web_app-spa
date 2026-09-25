import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  clearStoredToken,
  createGitHubRelease,
  deleteGitHubRelease,
  fetchCurrentUser,
  fetchReleases,
  formatBytes,
  getGithubNewReleaseUrl,
  getStoredRepo,
  getStoredToken,
  setStoredRepo,
  setStoredToken,
  type Release,
} from "../api";

export default function ApkUpload() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);
  const [repo, setRepo] = useState(getStoredRepo());
  const [isEditingRepo, setIsEditingRepo] = useState(false);
  const [tempRepo, setTempRepo] = useState(repo);

  // Auth state (GitHub Personal Access Token)
  const [token, setTokenState] = useState(getStoredToken());
  const [user, setUser] = useState<{ username: string; name: string; avatarUrl: string } | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  // Release form state
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

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

  // Load releases on mount
  useEffect(() => {
    loadData();
    if (token) {
      fetchCurrentUser(token)
        .then(setUser)
        .catch(() => {
          // Token expired or invalid
          setUser(null);
        });
    }
  }, []);

  function handleSaveRepo(e: FormEvent) {
    e.preventDefault();
    setStoredRepo(tempRepo);
    setRepo(getStoredRepo());
    setIsEditingRepo(false);
    loadData(true);
  }

  async function handleSaveToken(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!tokenInput.trim()) {
      clearStoredToken();
      setTokenState("");
      setUser(null);
      setShowTokenModal(false);
      return;
    }

    try {
      const u = await fetchCurrentUser(tokenInput.trim());
      setStoredToken(tokenInput.trim());
      setTokenState(tokenInput.trim());
      setUser(u);
      setShowTokenModal(false);
      setNotice(`Signed in as GitHub user @${u.username}`);
      loadData(true);
    } catch (err: any) {
      setError(err.message || "Invalid GitHub token");
    }
  }

  function handleSignOut() {
    clearStoredToken();
    setTokenState("");
    setUser(null);
    setNotice("Signed out of GitHub");
  }

  // 1-Click GitHub Web Publisher
  function handleOneClickPublish(e: FormEvent) {
    e.preventDefault();
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

    setNotice(
      `GitHub release page opened! Drag & drop "${file ? file.name : "your .apk"}" into the release assets area on GitHub and click "Publish release". Then click "Refresh from GitHub" here.`
    );
  }

  // Direct API Release creation (if user provided a GitHub PAT)
  async function handleApiCreateRelease() {
    if (!token) {
      setShowTokenModal(true);
      return;
    }

    if (!version.trim()) {
      setError("Please enter a release version (e.g. 1.0.4)");
      return;
    }

    setError("");
    setNotice("");
    setBusy(true);

    try {
      const cleanVer = version.trim().startsWith("v") ? version.trim() : `v${version.trim()}`;
      const releaseTitle = title.trim() || `QuickBillPoss ${cleanVer}`;
      const fullNotes = notes.trim()
        ? `## What's Changed & Fixed:\n${notes.trim()}\n\n---\n*Build released via QuickBill POS Developer Console*`
        : `*Build released via QuickBill POS Developer Console*`;

      const rel = await createGitHubRelease(cleanVer, releaseTitle, fullNotes, token, repo);
      setNotice(`Release ${cleanVer} created on GitHub! Opening release to attach APK file...`);
      window.open(rel.htmlUrl, "_blank");
      setVersion("");
      setTitle("");
      setNotes("");
      setFile(null);
      await loadData(true);
    } catch (err: any) {
      setError(err.message || "Failed to create release on GitHub");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteRelease(id: string, ver: string) {
    if (!token) {
      alert("Sign in with your GitHub Personal Access Token to delete releases.");
      setShowTokenModal(true);
      return;
    }
    if (!confirm(`Delete release ${ver} from GitHub? This cannot be undone.`)) return;

    setError("");
    try {
      await deleteGitHubRelease(id, token, repo);
      setNotice(`Deleted release ${ver} from GitHub.`);
      await loadData(true);
    } catch (err: any) {
      setError(err.message || "Failed to delete release");
    }
  }

  return (
    <div className="login-page" style={{ alignItems: "start", paddingTop: 32, paddingBottom: 60 }}>
      <div className="console" style={{ width: "min(1080px, 100%)" }}>
        {/* Top Header */}
        <div className="row" style={{ flexWrap: "wrap", gap: 14 }}>
          <div>
            <Link to="/" className="brand">
              <span className="logo">Q</span>
              QuickBill POS
            </Link>
            <h2 style={{ margin: "10px 0 4px", fontSize: 26 }}>APK Release Console</h2>
            <p className="lede" style={{ fontSize: 14, margin: 0 }}>
              Releases are hosted directly on <strong>GitHub Releases</strong>. 100% frontend SPA — no offline server needed.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="Fetch latest releases from GitHub"
            >
              {refreshing ? "Refreshing…" : "↻ Refresh from GitHub"}
            </button>

            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #bfdbfe" }}
                  />
                ) : null}
                <span style={{ fontSize: 13, fontWeight: 700 }}>@{user.username}</span>
                <button className="btn btn-outline" type="button" onClick={handleSignOut} style={{ padding: "6px 12px", fontSize: 13 }}>
                  Sign out
                </button>
              </div>
            ) : (
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setTokenInput(token);
                  setShowTokenModal(true);
                }}
              >
                Sign in with GitHub Token
              </button>
            )}
          </div>
        </div>

        {/* GitHub Repository Bar */}
        <div
          style={{
            margin: "18px 0 12px",
            padding: "10px 16px",
            background: "#f0f6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <span style={{ fontWeight: 700, color: "var(--navy)" }}>Target Repository:</span>
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
                  (change repo)
                </button>
              </>
            )}
          </div>

          <a
            href={`https://github.com/${repo}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: "var(--navy)", fontWeight: 600 }}
          >
            View on GitHub Releases ↗
          </a>
        </div>

        {error ? <div className="err" style={{ marginTop: 14 }}>{error}</div> : null}
        {notice ? <div className="ok" style={{ marginTop: 14 }}>{notice}</div> : null}

        {/* Release Publisher Form */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--line)",
            borderRadius: 20,
            padding: "22px",
            marginTop: 18,
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 19 }}>Publish New APK Release</h3>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                background: "#e0f2fe",
                color: "#0369a1",
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              Includes Fix Notes &amp; APK
            </span>
          </div>

          <form onSubmit={handleOneClickPublish}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
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
                  placeholder="e.g. QuickBillPoss 1.0.4 — Thermal Print & Offline Fixes"
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
              These fix notes will appear prominently on the homepage so users know what changed in this build.
            </p>

            <label>Select Android APK File (Local Check)</label>
            <div className="drop" style={{ padding: "18px" }}>
              <input
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (f && !version) {
                    // Try to infer version from filename like QuickBillPoss-1.0.4.apk
                    const m = f.name.match(/(\d+\.\d+(\.\d+)?)/);
                    if (m) setVersion(m[1]);
                  }
                }}
              />
              <div className="size-preview" style={{ marginTop: 8 }}>
                {file
                  ? `✓ Selected: ${file.name} (${sizeLabel}) · Ready to publish`
                  : "Choose an APK to verify file size and build name before publishing."}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "12px 24px" }}
                disabled={busy}
              >
                🚀 1-Click Publish to GitHub Releases
              </button>

              {token ? (
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={handleApiCreateRelease}
                  disabled={busy}
                >
                  {busy ? "Creating Release…" : "Publish via GitHub Token"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowTokenModal(true)}
                >
                  🔑 Add GitHub Token for Direct API Publish
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Published Releases Section */}
        <div style={{ marginTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>
              Published Releases on GitHub ({releases.length})
            </h3>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
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
                Repository <code>{repo}</code> does not have any published releases yet. Use the form above to publish your first APK release!
              </p>
              <a
                className="btn btn-primary"
                href={`https://github.com/${repo}/releases/new`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Create First Release on GitHub
              </a>
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

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                      {token ? (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDeleteRelease(r.id, r.version)}
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

      {/* GitHub Token Modal */}
      {showTokenModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            zIndex: 100,
          }}
        >
          <form
            onSubmit={handleSaveToken}
            style={{
              width: "min(480px, 100%)",
              background: "#fff",
              borderRadius: 20,
              padding: 26,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>GitHub Authentication</h3>
            <p className="lede" style={{ fontSize: 13.5, margin: "0 0 16px" }}>
              Enter a GitHub Personal Access Token (PAT) with <code>repo</code> or <code>contents:write</code> scope to publish or delete releases directly from this console.
            </p>

            <label htmlFor="tokenInput">GitHub Personal Access Token</label>
            <input
              id="tokenInput"
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              autoComplete="off"
            />

            <p style={{ fontSize: 12, marginTop: 8, color: "var(--muted)" }}>
              Need a token?{" "}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=QuickBill+POS+Releases"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--blue)", textDecoration: "underline" }}
              >
                Generate one on GitHub (1-click)
              </a>
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowTokenModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save &amp; Verify
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
