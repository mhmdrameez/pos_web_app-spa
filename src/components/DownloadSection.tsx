import { useState } from "react";
import type { Release } from "../api";
import Icon from "./Icon";
import { waLink } from "../lib/contact";

type Props = {
  release: Release | null;
  loaded: boolean;
  olderReleases: Release[];
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function DownloadSection({ release, loaded, olderReleases }: Props) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (!release) return;
    try {
      await navigator.clipboard.writeText(release.downloadUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked; the direct link is still available */
    }
  };

  const qrUrl = release
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=0&data=${encodeURIComponent(
        release.downloadUrl
      )}`
    : "";

  return (
    <section className="qb-sec qb-dl" id="download">
      <div className="qb-wrap qb-dl__grid">
        <div>
          <p className="qb-eyebrow">Download</p>
          <h2 className="qb-h2">Get QuickBill POS on your Android phone</h2>
          <p className="qb-sub">
            Direct download. You don&rsquo;t need a Play Store account, and you don&rsquo;t have to sign up to install.
          </p>

          {release ? (
            <>
              <dl className="qb-dl__meta">
                <div>
                  <dt>Version</dt>
                  <dd>{release.version}</dd>
                </div>
                <div>
                  <dt>Size</dt>
                  <dd>{release.sizeLabel}</dd>
                </div>
                {formatDate(release.uploadedAt) && (
                  <div>
                    <dt>Released</dt>
                    <dd>{formatDate(release.uploadedAt)}</dd>
                  </div>
                )}
                <div>
                  <dt>Needs</dt>
                  <dd>Android 7.0+, 64-bit</dd>
                </div>
              </dl>

              <div className="qb-cta-row">
                <a
                  className="qb-btn qb-btn--primary"
                  href={release.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="download" />
                  <span className="qb-btn__text">
                    <span className="qb-btn__main">Download for Android</span>
                    <span className="qb-btn__sub">
                      {release.version} · {release.sizeLabel}
                    </span>
                  </span>
                </a>
                <button type="button" className="qb-btn qb-btn--ghost-light" onClick={copyLink}>
                  <Icon name={copied ? "check" : "copy"} />
                  <span>{copied ? "Link copied" : "Copy link"}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="qb-dl__empty">
              <p>
                {loaded
                  ? "The latest build is being updated right now. Message us on WhatsApp and we will send you the app directly."
                  : "Checking for the latest build…"}
              </p>
              <a
                className="qb-btn qb-btn--wa"
                href={waLink("Hi QuickBill POS team, please send me the Android app (APK).")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" />
                <span>Ask for the app on WhatsApp</span>
              </a>
            </div>
          )}

          <div className="qb-install">
            <h3>Installing for the first time?</h3>
            <ol>
              <li>Tap download and open the file when it finishes.</li>
              <li>
                If Android says it can&rsquo;t install from this source, tap <strong>Settings</strong> and switch on{" "}
                <strong>Allow from this source</strong>. This is a normal Android prompt for apps outside the Play
                Store.
              </li>
              <li>Open QuickBill POS, add your shop details, and make your first bill.</li>
            </ol>
          </div>
        </div>

        {release && (
          <aside className="qb-dl__qr" aria-label="Scan to download on your phone">
            <img src={qrUrl} width={200} height={200} alt={`QR code to download QuickBill POS ${release.version}`} loading="lazy" />
            <p className="qb-dl__qr-title">On a computer?</p>
            <p>Point your phone camera at this code to download the app on your phone.</p>
          </aside>
        )}
      </div>

      {release && olderReleases.length > 0 && (
        <div className="qb-wrap">
          <details className="qb-older">
            <summary>Earlier versions ({olderReleases.length})</summary>
            <ul>
              {olderReleases.map((rel) => (
                <li key={rel.id}>
                  <span>
                    {rel.title || rel.version}
                    <small>
                      {rel.sizeLabel}
                      {formatDate(rel.uploadedAt) ? ` · ${formatDate(rel.uploadedAt)}` : ""}
                    </small>
                  </span>
                  <a href={rel.downloadUrl} target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </section>
  );
}
