import { useState } from "react";
import type { Release } from "../api";
import Icon from "./Icon";
import { waLink } from "../lib/contact";
import { langInfo } from "../i18n/config";
import { Rich, useI18n } from "../i18n/context";

type Props = {
  release: Release | null;
  loaded: boolean;
  olderReleases: Release[];
};

export default function DownloadSection({ release, loaded, olderReleases }: Props) {
  const { lang, t } = useI18n();
  const d = t.download;
  const [copied, setCopied] = useState(false);

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
    if (!release) return;
    try {
      await navigator.clipboard.writeText(release.downloadUrl);
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

          {release ? (
            <>
              <dl className="qb-dl__meta">
                <div>
                  <dt>{d.version}</dt>
                  <dd>{release.version}</dd>
                </div>
                <div>
                  <dt>{d.size}</dt>
                  <dd>{release.sizeLabel}</dd>
                </div>
                {formatDate(release.uploadedAt) && (
                  <div>
                    <dt>{d.released}</dt>
                    <dd>{formatDate(release.uploadedAt)}</dd>
                  </div>
                )}
                <div>
                  <dt>{d.needs}</dt>
                  <dd>{d.needsVal}</dd>
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
                    <span className="qb-btn__main">{d.btnMain}</span>
                    <span className="qb-btn__sub">
                      {release.version} · {release.sizeLabel}
                    </span>
                  </span>
                </a>
                <button type="button" className="qb-btn qb-btn--ghost-light" onClick={copyLink}>
                  <Icon name={copied ? "check" : "copy"} />
                  <span>{copied ? d.copied : d.copy}</span>
                </button>
              </div>
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

      {release && olderReleases.length > 0 && (
        <div className="qb-wrap">
          <details className="qb-older">
            <summary>
              {d.older} ({olderReleases.length})
            </summary>
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
                    {d.dl}
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
