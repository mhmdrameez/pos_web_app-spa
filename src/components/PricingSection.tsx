import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { WA_DISPLAY, waLink } from "../lib/contact";
import { useI18n } from "../i18n/context";
import type { Plan } from "../i18n/types";

/** Numbers and the English order text the team reads on WhatsApp. The visible text comes from the dictionary. */
const PLAN_META = [
  { id: "monthly", price: "99", amount: 99, orderName: "Monthly license", period: "per month", best: false },
  { id: "yearly", price: "999", amount: 999, orderName: "Yearly license", period: "per year", best: true },
  { id: "kit", price: "3,199", amount: 3199, orderName: "Annual kit (printer + 1 year)", period: "one payment", best: false },
];

export default function PricingSection() {
  const { lang, t } = useI18n();
  const p = t.pricing;
  const [selected, setSelected] = useState<number | null>(null);
  const [shop, setShop] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const firstField = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      opener.current?.focus();
    };
  }, [selected]);

  const meta = selected !== null ? PLAN_META[selected] : null;
  const plan: Plan | null = selected !== null ? p.plans[selected] : null;

  const message = meta
    ? [
        "Hello QuickBill POS team,",
        `I'd like to order: ${meta.orderName} (₹${meta.amount.toLocaleString("en-IN")}, ${meta.period}).`,
        `Page language: ${lang}`,
        "",
        `Shop: ${shop.trim() || "-"}`,
        `Phone: ${phone.trim() || "-"}`,
        `City: ${city.trim() || "-"}`,
        "",
        "Please share the payment and activation details.",
      ].join("\n")
    : "";

  return (
    <section className="qb-sec qb-sec--alt" id="pricing">
      <div className="qb-wrap">
        <div className="qb-head">
          <p className="qb-eyebrow">{p.eyebrow}</p>
          <h2 className="qb-h2">{p.h2}</h2>
          <p className="qb-sub">{p.sub}</p>
        </div>

        <div className="qb-plans">
          {PLAN_META.map((m, i) => {
            const pl = p.plans[i];
            return (
              <article key={m.id} className={`qb-plan ${m.best ? "qb-plan--best" : ""}`}>
                <p className="qb-plan__tag">{pl.tag}</p>
                <h3>{pl.name}</h3>
                <p className="qb-plan__blurb">{pl.blurb}</p>

                <p className="qb-price">
                  <span className="qb-price__cur">₹</span>
                  {m.price}
                  <small>{pl.unit}</small>
                </p>
                <p className="qb-plan__was">
                  {pl.was ? (
                    <>
                      <s>{pl.was}</s> <strong>{pl.save}</strong>
                    </>
                  ) : (
                    <>&nbsp;</>
                  )}
                </p>

                <ul className="qb-plan__list">
                  {pl.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" size={20} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`qb-btn ${m.best ? "qb-btn--primary" : "qb-btn--ghost"}`}
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setSelected(i);
                  }}
                >
                  {pl.cta}
                </button>
                <p className="qb-plan__note">{pl.note}</p>
              </article>
            );
          })}
        </div>

        <p className="qb-pay-line">
          {p.payPre}{" "}
          <a href={waLink("Hi QuickBill POS team, I have a question before buying.")} target="_blank" rel="noopener noreferrer">
            {WA_DISPLAY}
          </a>
          {p.payPost}
        </p>
        <p className="qb-pay-line qb-pay-line--terms">
          {p.terms.pre}
          <a href="/terms-and-conditions">{t.nav.terms}</a>
          {p.terms.post}
        </p>
      </div>

      {meta && plan && (
        <div className="qb-modal" onClick={() => setSelected(null)}>
          <div
            className="qb-modal__box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qb-order-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="qb-modal__top">
              <div>
                <p className="qb-eyebrow">{p.modal.order}</p>
                <h3 id="qb-order-title">{plan.name}</h3>
              </div>
              <button type="button" className="qb-modal__close" onClick={() => setSelected(null)} aria-label={p.modal.close}>
                <span />
                <span />
              </button>
            </div>

            <p className="qb-modal__price">
              ₹{meta.amount.toLocaleString("en-IN")} <small>{plan.unit}</small>
            </p>
            <ul className="qb-modal__list">
              {plan.includes.map((inc) => (
                <li key={inc}>
                  <Icon name="check" size={18} />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>

            <div className="qb-form">
              <label htmlFor="qb-shop">{p.modal.shop}</label>
              <input
                id="qb-shop"
                ref={firstField}
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder={p.modal.shopPh}
                autoComplete="organization"
              />
              <div className="qb-form__two">
                <div>
                  <label htmlFor="qb-phone">{p.modal.phone}</label>
                  <input
                    id="qb-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={p.modal.phonePh}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="qb-city">{p.modal.city}</label>
                  <input
                    id="qb-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={p.modal.cityPh}
                    autoComplete="address-level2"
                  />
                </div>
              </div>
            </div>

            <a className="qb-btn qb-btn--wa qb-btn--block" href={waLink(message)} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" />
              <span>{p.modal.cont}</span>
            </a>
            <p className="qb-modal__fine">{p.modal.fine}</p>
          </div>
        </div>
      )}
    </section>
  );
}
