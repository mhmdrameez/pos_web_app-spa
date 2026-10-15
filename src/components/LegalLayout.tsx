import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import SEO from "./SEO";
import SiteHeader from "./SiteHeader";
import SiteFooter, { WhatsAppFloat } from "./SiteFooter";
import Icon from "./Icon";
import { LEGAL, isPlaceholder } from "../lib/legal";
import { legalGraph } from "../seo/schema";
import { SITE } from "../seo/site";

export type LegalSection = { id: string; title: string; body: ReactNode };

type Props = {
  kind: "privacy" | "terms";
  title: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  glance: string[];
  sections: LegalSection[];
  next: { to: string; label: string };
};

/** Shows a value normally, or highlighted if it is still a [placeholder]. */
export function Fill({ value }: { value: string }) {
  return isPlaceholder(value) ? <mark className="qb-fill">{value}</mark> : <>{value}</>;
}

export function Mail({ address }: { address: string }) {
  return <a href={`mailto:${address}`}>{address}</a>;
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="qb-table">
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} data-label={head[j]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TocList({ sections, active, onPick }: { sections: LegalSection[]; active: string; onPick?: () => void }) {
  return (
    <ol>
      {sections.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className={active === s.id ? "is-active" : ""} onClick={onPick} aria-current={active === s.id ? "location" : undefined}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function LegalLayout({
  kind,
  title,
  seoTitle,
  seoDescription,
  canonicalPath,
  glance,
  sections,
  next,
}: Props) {
  const [active, setActive] = useState(sections[0].id);
  const [copied, setCopied] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // sections are module-level constants per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${SITE.origin}${canonicalPath}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="qb" id={`${kind}-page`}>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        type="article"
        schemaData={legalGraph({ path: canonicalPath, name: title, description: seoDescription })}
      />
      <SiteHeader />

      <main id="main-content">
        <section className="qb-lhero">
          <div className="qb-wrap">
            <p className="qb-eyebrow">Legal</p>
            <h1>{title}</h1>

            <nav className="qb-seg" aria-label="Legal documents">
              <Link to="/privacy-policy" className={kind === "privacy" ? "is-on" : ""} aria-current={kind === "privacy" ? "page" : undefined}>
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className={kind === "terms" ? "is-on" : ""} aria-current={kind === "terms" ? "page" : undefined}>
                Terms &amp; Conditions
              </Link>
            </nav>

            <dl className="qb-lmeta">
              <div>
                <dt>Effective</dt>
                <dd>{LEGAL.effectiveDate}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{LEGAL.updatedDate}</dd>
              </div>
              <div>
                <dt>Publisher</dt>
                <dd>
                  <Fill value={LEGAL.entityName} />
                </dd>
              </div>
            </dl>

            <div className="qb-lactions">
              <button type="button" className="qb-btn qb-btn--ghost qb-btn--sm" onClick={() => window.print()}>
                Print
              </button>
              <button type="button" className="qb-btn qb-btn--ghost qb-btn--sm" onClick={copyLink}>
                <Icon name={copied ? "check" : "copy"} size={18} />
                {copied ? "Link copied" : "Copy link"}
              </button>
            </div>
          </div>
        </section>

        <div className="qb-wrap qb-legal">
          <aside className="qb-toc" aria-label="On this page">
            <p className="qb-toc__title">On this page</p>
            <TocList sections={sections} active={active} />
          </aside>

          <article className="qb-prose">
            <details className="qb-toc-m" open={tocOpen} onToggle={(e) => setTocOpen((e.currentTarget as HTMLDetailsElement).open)}>
              <summary>On this page</summary>
              <TocList sections={sections} active={active} onPick={() => setTocOpen(false)} />
            </details>

            <div className="qb-glance">
              <p className="qb-glance__title">In short</p>
              <ul>
                {glance.map((g) => (
                  <li key={g}>
                    <Icon name="check" size={20} />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
              <p className="qb-glance__fine">This summary is for convenience. The full text below is what applies.</p>
            </div>

            {sections.map((s, i) => (
              <section key={s.id} className="qb-sect">
                <h2 id={s.id}>
                  <span className="qb-sect__n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                  <a className="qb-anchor" href={`#${s.id}`} aria-label={`Link to section: ${s.title}`}>
                    #
                  </a>
                </h2>
                {s.body}
              </section>
            ))}

            <Link className="qb-lnext" to={next.to}>
              <span>
                <small>Also read</small>
                {next.label}
              </span>
              <Icon name="arrow" size={26} />
            </Link>
          </article>
        </div>
      </main>

      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
