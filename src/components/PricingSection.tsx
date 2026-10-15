import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { WA_DISPLAY, waLink } from "../lib/contact";

type Plan = {
  id: string;
  tag: string;
  name: string;
  price: string;
  unit: string;
  blurb: string;
  was?: string;
  save?: string;
  features: string[];
  cta: string;
  note: string;
  best?: boolean;
  order: { name: string; amount: number; period: string; includes: string[] };
};

const PLANS: Plan[] = [
  {
    id: "monthly",
    tag: "Flexible",
    name: "Monthly",
    price: "99",
    unit: "per month",
    blurb: "For small shops, tea stalls and seasonal counters. Stop whenever you like.",
    features: [
      "Unlimited bills and customers",
      "Works with no internet",
      "UPI QR on screen and on the bill",
      "GST with CGST and SGST, or 0%",
      "Bluetooth printer support",
    ],
    cta: "Start monthly · ₹99",
    note: "Cancel anytime",
    order: {
      name: "Monthly license",
      amount: 99,
      period: "per month",
      includes: ["Unlimited bills", "Offline billing", "UPI QR codes", "Android app"],
    },
  },
  {
    id: "yearly",
    tag: "Best value",
    name: "Yearly",
    price: "999",
    unit: "per year",
    blurb: "For shops that are here to stay. About ₹83 a month.",
    was: "₹1,188",
    save: "Save ₹189",
    features: [
      "Everything in Monthly",
      "365 days, no renewal in between",
      "Priority WhatsApp support",
      "Help setting up your items or menu",
      "Renewal price locked",
    ],
    cta: "Get yearly · ₹999",
    note: "7-day money-back guarantee",
    best: true,
    order: {
      name: "Yearly license",
      amount: 999,
      period: "per year",
      includes: ["365 days of billing", "Priority WhatsApp support", "Item / menu setup help"],
    },
  },
  {
    id: "kit",
    tag: "Printer included",
    name: "Annual kit",
    price: "3,199",
    unit: "one payment",
    blurb: "A Bluetooth printer and a year of the app. Plug in, pair, and bill.",
    was: "₹3,499",
    save: "Save ₹300",
    features: [
      "Wireless Bluetooth thermal printer (₹2,500 value)",
      "1 year of QuickBill POS (₹999 value)",
      "5 paper rolls free",
      "WhatsApp help to get set up",
      "Free courier delivery across India",
      "1 year hardware replacement support",
    ],
    cta: "Order the kit · ₹3,199",
    note: "Ready to bill about 2 minutes after delivery",
    order: {
      name: "Annual kit (printer + 1 year)",
      amount: 3199,
      period: "one payment",
      includes: [
        "Wireless Bluetooth thermal printer",
        "1 year of QuickBill POS",
        "5 paper rolls",
        "Free courier delivery across India",
      ],
    },
  },
];

export default function PricingSection() {
  const [selected, setSelected] = useState<Plan | null>(null);
  const [shop, setShop] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const firstField = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selected) return;
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

  const message = selected
    ? [
        "Hello QuickBill POS team,",
        `I'd like to order: ${selected.order.name} (₹${selected.order.amount.toLocaleString("en-IN")}, ${selected.order.period}).`,
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
          <p className="qb-eyebrow">Pricing</p>
          <h2 className="qb-h2">One price. Unlimited bills.</h2>
          <p className="qb-sub">
            We don&rsquo;t charge per bill or per device. Pick monthly, yearly, or get the kit with a printer in the
            box.
          </p>
        </div>

        <div className="qb-plans">
          {PLANS.map((plan) => (
            <article key={plan.id} className={`qb-plan ${plan.best ? "qb-plan--best" : ""}`}>
              <p className="qb-plan__tag">{plan.tag}</p>
              <h3>{plan.name}</h3>
              <p className="qb-plan__blurb">{plan.blurb}</p>

              <p className="qb-price">
                <span className="qb-price__cur">₹</span>
                {plan.price}
                <small>{plan.unit}</small>
              </p>
              <p className="qb-plan__was">
                {plan.was ? (
                  <>
                    <s>{plan.was}</s> <strong>{plan.save}</strong>
                  </>
                ) : (
                  <>&nbsp;</>
                )}
              </p>

              <ul className="qb-plan__list">
                {plan.features.map((f) => (
                  <li key={f}>
                    <Icon name="check" size={20} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`qb-btn ${plan.best ? "qb-btn--primary" : "qb-btn--ghost"}`}
                onClick={(e) => {
                  opener.current = e.currentTarget;
                  setSelected(plan);
                }}
              >
                {plan.cta}
              </button>
              <p className="qb-plan__note">{plan.note}</p>
            </article>
          ))}
        </div>

        <p className="qb-pay-line">
          Pay by UPI, card, net banking or cash on delivery. Questions before you buy? WhatsApp{" "}
          <a href={waLink("Hi QuickBill POS team, I have a question before buying.")} target="_blank" rel="noopener noreferrer">
            {WA_DISPLAY}
          </a>
          .
        </p>
      </div>

      {selected && (
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
                <p className="qb-eyebrow">Order</p>
                <h3 id="qb-order-title">{selected.order.name}</h3>
              </div>
              <button type="button" className="qb-modal__close" onClick={() => setSelected(null)} aria-label="Close">
                <span />
                <span />
              </button>
            </div>

            <p className="qb-modal__price">
              ₹{selected.order.amount.toLocaleString("en-IN")} <small>{selected.order.period}</small>
            </p>
            <ul className="qb-modal__list">
              {selected.order.includes.map((i) => (
                <li key={i}>
                  <Icon name="check" size={18} />
                  <span>{i}</span>
                </li>
              ))}
            </ul>

            <div className="qb-form">
              <label htmlFor="qb-shop">Shop name</label>
              <input
                id="qb-shop"
                ref={firstField}
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder="Ramesh Kirana Store"
                autoComplete="organization"
              />
              <div className="qb-form__two">
                <div>
                  <label htmlFor="qb-phone">WhatsApp number</label>
                  <input
                    id="qb-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="qb-city">City</label>
                  <input
                    id="qb-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kochi"
                    autoComplete="address-level2"
                  />
                </div>
              </div>
            </div>

            <a className="qb-btn qb-btn--wa qb-btn--block" href={waLink(message)} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" />
              <span>Continue on WhatsApp</span>
            </a>
            <p className="qb-modal__fine">
              This opens WhatsApp with your order already written. Nothing is charged until we confirm with you.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
