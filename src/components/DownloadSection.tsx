import { useState } from "react";
import { detectVariant, type Release } from "../api";
import Icon from "./Icon";
import { waLink } from "../lib/contact";
import { trackDownload } from "../lib/track";
import { langInfo } from "../i18n/config";
import { Rich, useI18n } from "../i18n/context";

type Props = {
  /** Latest 64-bit (arm64-v8a) build. */
  release: Release | null;
  /** Latest Universal build (all devices), when one has been published. */
  universalRelease?: Release | null;
  loaded: boolean;
  olderReleases: Release[];
};

export default function DownloadSection({ release, universalRelease = null, loaded, olderReleases }: Props) {
  const { lang, t } = useI18n();
  const d = t.download;
  const [copied, setCopied] = useState(false);

  // The 64-bit build leads; if only a Universal build exists, it takes the primary spot.
  const primary = release || universalRelease;
  const secondary = universalRelease && universalRelease.id !== primary?.id ? universalRelease : null;
  const primaryIsUniversal = !release && Boolean(universalRelease);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(`${langInfo(lang).htmlLang}-u-nu-latn`, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const copyLink = async () => {
    if (!primary) return;
    try {
      await navigator.clipboard.writeText(primary.downloadUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked; the direct link is still available */
    }
  };

  return (
    <section className="qb-sec qb-dl" id="download">
      <div className="qb-wrap qb-dl__grid">
        <div>
          <p className="qb-eyebrow">{d.eyebrow}</p>
          <h2 className="qb-h2">{d.h2}</h2>
          <p className="qb-sub">{d.sub}</p>

          {primary ? (
            <>
              <dl className="qb-dl__meta">
                <div>
                  <dt>{d.version}</dt>
                  <dd>{primary.version}</dd>
                </div>
                <div>
                  <dt>{d.size}</dt>
                  <dd>{primary.sizeLabel}</dd>
                </div>
                {formatDate(primary.uploadedAt) && (
                  <div>
                    <dt>{d.released}</dt>
                    <dd>{formatDate(primary.uploadedAt)}</dd>
                  </div>
                )}
                <div>
                  <dt>{d.needs}</dt>
                  <dd>{primaryIsUniversal ? d.tagUni : d.needsVal}</dd>
                </div>
              </dl>

              <div className="qb-cta-row">
                <a
                  className="qb-btn qb-btn--primary"
                  href={primary.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackDownload(primary.fileName)}
                >
                  <Icon name="download" />
                  <span className="qb-btn__text">
                    <span className="qb-btn__main">{primaryIsUniversal ? d.btnUni : d.btnMain}</span>
                    <span className="qb-btn__sub">
                      {primary.version} · {primary.sizeLabel} · {primaryIsUniversal ? d.tagUni : d.tag64}
                    </span>
                  </span>
                </a>
                {secondary && (
                  <a
                    className="qb-btn qb-btn--ghost-light"
                    href={secondary.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackDownload(secondary.fileName)}
                  >
                    <Icon name="download" />
                    <span className="qb-btn__text">
                      <span className="qb-btn__main">{d.btnUni}</span>
                      <span className="qb-btn__sub">
                        {secondary.version} · {secondary.sizeLabel} · {d.tagUni}
                      </span>
                    </span>
                  </a>
                )}
                <button type="button" className="qb-btn qb-btn--ghost-light" onClick={copyLink}>
                  <Icon name={copied ? "check" : "copy"} />
                  <span>{copied ? d.copied : d.copy}</span>
                </button>
              </div>

              {secondary && <p className="qb-dl__hint">{d.uniHint}</p>}
            </>
          ) : (
            <div className="qb-dl__empty">
              <p>{loaded ? d.emptyLoaded : d.emptyLoading}</p>
              <a
                className="qb-btn qb-btn--wa"
                href={waLink("Hi QuickBill POS team, please send me the Android app (APK).")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="chat" />
                <span>{d.askApp}</span>
              </a>
            </div>
          )}

          <div className="qb-install">
            <h3>{d.installTitle}</h3>
            <ol>
              {d.install.map((step) => (
                <li key={step}>
                  <Rich text={step} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {primary && olderReleases.length > 0 && (
        <div className="qb-wrap">
          <details className="qb-older">
            <summary>
              {d.older} ({olderReleases.length})
            </summary>
            <ul>
              {olderReleases.map((rel) => {
                const relVariant = rel.variant || detectVariant(rel.fileName, rel.version, rel.title);
                return (
                  <li key={rel.id}>
                    <span>
                      {rel.title || rel.version}
                      <small>
                        {relVariant === "universal" ? d.tagUni : d.tag64}
                        {` · ${rel.sizeLabel}`}
                        {formatDate(rel.uploadedAt) ? ` · ${formatDate(rel.uploadedAt)}` : ""}
                      </small>
                    </span>
                    <a
                      href={rel.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackDownload(rel.fileName)}
                    >
                      {d.dl}
                    </a>
                  </li>
                );
              })}
            </ul>
          </details>
        </div>
      )}
    </section>
  );
}
