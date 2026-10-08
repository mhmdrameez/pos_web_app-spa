import React, { useState } from "react";

export default function PricingSection() {
  const [filterCategory, setFilterCategory] = useState<"all" | "software" | "combos">("all");
  const [checkoutItem, setCheckoutItem] = useState<{
    name: string;
    price: number;
    billingPeriod: string;
    type: "software" | "hardware" | "combo";
    savings?: string;
    includes: string[];
  } | null>(null);

  const [merchantName, setMerchantName] = useState("");
  const [merchantPhone, setMerchantPhone] = useState("");
  const [merchantCity, setMerchantCity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const openCheckout = (
    name: string,
    price: number,
    billingPeriod: string,
    type: "software" | "hardware" | "combo",
    savings?: string,
    includes: string[] = []
  ) => {
    setCheckoutItem({
      name,
      price,
      billingPeriod,
      type,
      savings,
      includes,
    });
    setSubmitted(false);
  };

  const handleWhatsAppDirect = () => {
    if (!checkoutItem) return;
    const text = encodeURIComponent(
      `Hello QuickBill POS Team! 🇮🇳\nI want to order / activate the following:\n\n*Package:* ${checkoutItem.name}\n*Price:* ₹${checkoutItem.price} (${checkoutItem.billingPeriod})\n\n*Business Name:* ${
        merchantName || "Retail Merchant"
      }\n*Phone:* ${merchantPhone || "Not provided"}\n*City:* ${merchantCity || "India"}\n\nPlease share payment & delivery/activation details.`
    );
    window.open(`https://wa.me/919446960834?text=${text}`, "_blank");
  };

  return (
    <section className="section" id="pricing" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)" }}>
      <div className="wrap">
        <div className="section-head" style={{ textAlign: "center", margin: "0 auto 32px" }}>
          <span className="kicker">TRANSPARENT INDIAN PRICING & HARDWARE PACKAGES</span>
          <h2>Software Plans, Mobile Printer & All-in-One Kits</h2>
          <p className="sub" style={{ maxWidth: 700, margin: "0 auto" }}>
            Choose software-only licenses, order the wireless mobile thermal printer standalone for ₹2,500,
            or save more with complete all-in-one hardware + software combo kits.
          </p>

          {/* Category Filter Pills */}
          <div className="pricing-toggle-wrap">
            <button
              type="button"
              className={`pricing-toggle-btn ${filterCategory === "all" ? "active" : ""}`}
              onClick={() => setFilterCategory("all")}
            >
              All Plans & Combos
            </button>
            <button
              type="button"
              className={`pricing-toggle-btn ${filterCategory === "software" ? "active" : ""}`}
              onClick={() => setFilterCategory("software")}
            >
              Software Only (₹99 / ₹999)
            </button>
            <button
              type="button"
              className={`pricing-toggle-btn ${filterCategory === "combos" ? "active" : ""}`}
              onClick={() => setFilterCategory("combos")}
            >
              <span>Printer & Combos (₹2,500+)</span>
              <span className="pricing-save-badge">Save ₹300 🔥</span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
            alignItems: "stretch",
          }}
        >
          {/* ==============================================================
              CARD 1: SOFTWARE MONTHLY (₹99)
              ============================================================== */}
          {(filterCategory === "all" || filterCategory === "software") && (
            <div className="pricing-card">
              <div className="pricing-card-header">
                <span className="pricing-plan-badge">SOFTWARE ONLY</span>
                <h3 className="pricing-plan-title">Monthly License</h3>
                <p className="pricing-plan-desc">
                  Pocket-friendly flexibility for small shops, tea stalls & seasonal counters.
                </p>
              </div>

              <div className="pricing-price-wrap">
                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-num">99</span>
                  <span className="pricing-period">/ month</span>
                </div>
                <div className="pricing-daily-cost">
                  Just <strong>₹3.3 per day</strong> — Less than a single cup of cutting chai! ☕
                </div>
              </div>

              <ul className="pricing-features-list">
                <li>
                  <span className="check-icon">✓</span>
                  <strong>100% Offline Billing</strong> — Zero internet reliance
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Unlimited Bills & Customers</strong>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Dynamic UPI QR Codes</strong> (GPay / PhonePe / Paytm)
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>GST (CGST/SGST) & Composition 0%</strong>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Supports All Mobile Printers</strong> via Bluetooth
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Android APK + Desktop Web POS Access
                </li>
              </ul>

              <button
                type="button"
                className="btn btn-outline pricing-cta-btn"
                onClick={() =>
                  openCheckout("Monthly Software License", 99, "per month", "software", undefined, [
                    "Full offline billing engine",
                    "Unlimited bills & invoices",
                    "Dynamic UPI QR codes",
                    "Android APK + Web POS",
                  ])
                }
              >
                Get Monthly Plan (₹99) →
              </button>
              <div className="pricing-guarantee-note">Cancel anytime · Instant activation</div>
            </div>
          )}

          {/* ==============================================================
              CARD 2: SOFTWARE YEARLY (₹999)
              ============================================================== */}
          {(filterCategory === "all" || filterCategory === "software") && (
            <div className="pricing-card featured glow-border">
              <div className="pricing-featured-ribbon">👑 2 MONTHS FREE</div>

              <div className="pricing-card-header">
                <span className="pricing-plan-badge highlight">ANNUAL VALUE</span>
                <h3 className="pricing-plan-title">Yearly License</h3>
                <p className="pricing-plan-desc">
                  Maximum savings for established Kirana stores, bakeries, cafes & busy counters.
                </p>
              </div>

              <div className="pricing-price-wrap">
                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-num">999</span>
                  <span className="pricing-period">/ year</span>
                </div>
                <div className="pricing-old-price">
                  <span style={{ textDecoration: "line-through", color: "#94a3b8" }}>₹1,188/yr</span>
                  <span className="pricing-save-pill">Save ₹189 (16% OFF)</span>
                </div>
                <div className="pricing-daily-cost highlight">
                  Effective <strong>~₹83/month</strong> (Just <strong>₹2.7 per day</strong>)
                </div>
              </div>

              <ul className="pricing-features-list">
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>All Monthly Software Features Included</strong>
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>Full 365 Days Uninterrupted Billing</strong>
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>2 Months Completely FREE</strong>
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>Priority VIP WhatsApp & Remote Support</strong> 💬
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>Free Catalog / Menu Setup Assistance</strong>
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  Guaranteed Renewal Price Lock
                </li>
              </ul>

              <button
                type="button"
                className="btn btn-primary pricing-cta-btn"
                onClick={() =>
                  openCheckout(
                    "Yearly Software Value Pass",
                    999,
                    "per year",
                    "software",
                    "Save ₹189 (2 Months Free)",
                    [
                      "Full 365 days offline license",
                      "Priority WhatsApp & phone setup",
                      "Menu import assistance",
                      "Commercial Tax Invoice",
                    ]
                  )
                }
              >
                Claim Yearly Pass (₹999) →
              </button>
              <div className="pricing-guarantee-note">
                🛡️ 7-Day 100% Money-Back Guarantee
              </div>
            </div>
          )}

          {/* ==============================================================
              CARD 3: INDIVIDUAL MOBILE PRINTER (₹2,500)
              ============================================================== */}
          {(filterCategory === "all" || filterCategory === "combos") && (
            <div className="pricing-card">
              <div className="pricing-card-header">
                <span className="pricing-plan-badge" style={{ background: "#fef3c7", color: "#92400e" }}>
                  HARDWARE ONLY
                </span>
                <h3 className="pricing-plan-title">Mobile Thermal Printer</h3>
                <p className="pricing-plan-desc">
                  Heavy-duty portable Bluetooth thermal printer with rechargeable battery backup.
                </p>
              </div>

              <div className="pricing-price-wrap">
                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-num">2,500</span>
                  <span className="pricing-period">one-time</span>
                </div>
                <div className="pricing-daily-cost">
                  <strong>Zero Monthly Rental</strong> · Free delivery across India 🚚
                </div>
              </div>

              <ul className="pricing-features-list">
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Rechargeable Battery Powered</strong> — Long-lasting backup
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>High-Speed 58mm Thermal Output</strong>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Bluetooth + USB Dual Connectivity</strong>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Zero Ink / No Ribbon Required</strong>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Includes Charger, Cable & 2 Free Sample Paper Rolls
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  1 Year Hardware Warranty
                </li>
              </ul>

              <button
                type="button"
                className="btn btn-outline pricing-cta-btn"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                onClick={() =>
                  openCheckout(
                    "Wireless Mobile Thermal Printer (Standalone)",
                    2500,
                    "one-time purchase",
                    "hardware",
                    "Free Shipping across India",
                    [
                      "1x Wireless Bluetooth 58mm Thermal Printer",
                      "1x Rechargeable Battery Pack",
                      "1x Fast Charger & USB Cable",
                      "2x High-Grade Thermal Paper Rolls (Free)",
                      "1 Year Warranty + Pan-India Courier Delivery",
                    ]
                  )
                }
              >
                Buy Printer Only (₹2,500) →
              </button>
              <div className="pricing-guarantee-note">Cash on Delivery & UPI available</div>
            </div>
          )}

          {/* ==============================================================
              CARD 4: ALL-IN-ONE ANNUAL POS COMBO (₹3,199) — BEST VALUE
              ============================================================== */}
          {(filterCategory === "all" || filterCategory === "combos") && (
            <div
              className="pricing-card featured"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)",
                borderColor: "#3b82f6",
                boxShadow: "0 18px 40px rgba(37, 99, 235, 0.18)",
              }}
            >
              <div
                className="pricing-featured-ribbon"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                🔥 BEST VALUE COMBO · SAVE ₹300
              </div>

              <div className="pricing-card-header">
                <span
                  className="pricing-plan-badge"
                  style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}
                >
                  COMPLETE HARDWARE + SOFTWARE BUNDLE
                </span>
                <h3 className="pricing-plan-title">Annual All-in-One Kit</h3>
                <p className="pricing-plan-desc">
                  Mobile Printer (₹2,500) + 1 Full Year Software (₹999) + Free Starter Rolls!
                </p>
              </div>

              <div className="pricing-price-wrap">
                <div className="pricing-amount">
                  <span className="pricing-currency">₹</span>
                  <span className="pricing-num">3,199</span>
                  <span className="pricing-period">package</span>
                </div>
                <div className="pricing-old-price">
                  <span style={{ textDecoration: "line-through", color: "#94a3b8" }}>₹3,499 Total</span>
                  <span className="pricing-save-pill">Instant ₹300 Combo Savings!</span>
                </div>
                <div className="pricing-daily-cost highlight" style={{ color: "#15803d" }}>
                  Complete POS setup for an entire year! No extra software or hardware cost.
                </div>
              </div>

              <ul className="pricing-features-list">
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>1x Wireless Mobile Thermal Printer (₹2,500 value)</strong>
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>1 Year Unlimited Software License (₹999 value)</strong>
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>5x High-Grade Thermal Paper Rolls (Free Gift)</strong> 🎁
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>VIP WhatsApp Onboarding & Setup Assistance</strong> 💬
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  <strong>Free Doorstep Courier Delivery Across India</strong>
                </li>
                <li>
                  <span className="check-icon highlight">✓</span>
                  1 Year Complete Hardware Replacement Support
                </li>
              </ul>

              <button
                type="button"
                className="btn btn-primary pricing-cta-btn"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.35)",
                }}
                onClick={() =>
                  openCheckout(
                    "All-in-One Annual POS Kit (Printer + 1 Yr Software)",
                    3199,
                    "complete combo package",
                    "combo",
                    "Save ₹300 + 5 Free Rolls",
                    [
                      "1x Wireless Mobile Bluetooth Thermal Printer",
                      "1x Full 1-Year QuickBill Software License (APK & Web Desk)",
                      "5x Thermal Receipt Paper Rolls (Free)",
                      "VIP WhatsApp Remote Onboarding & Menu Setup",
                      "Free Express Courier Shipping Across India",
                    ]
                  )
                }
              >
                Order All-in-One Kit (₹3,199) →
              </button>
              <div className="pricing-guarantee-note">
                ✨ Ready to Bill within 2 minutes of delivery
              </div>
            </div>
          )}
        </div>

        {/* Quick Starter Combo (Monthly + Printer) Note */}
        <div
          style={{
            marginTop: 22,
            background: "#ffffff",
            border: "1px dashed var(--line)",
            borderRadius: 14,
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <strong style={{ fontSize: 14, color: "var(--navy)" }}>
              Looking for Printer + Monthly software trial?
            </strong>
            <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 8 }}>
              Get the Mobile Printer + 1 Month Software License for just <strong>₹2,599</strong>!
            </span>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "6px 14px", fontSize: 13 }}
            onClick={() =>
              openCheckout(
                "Starter Kit (Printer + 1 Month Software)",
                2599,
                "combo package",
                "combo",
                "Includes 1 Month License + Hardware",
                [
                  "1x Wireless Mobile Bluetooth Thermal Printer",
                  "1x 1-Month QuickBill Software License",
                  "2x Thermal Paper Rolls",
                  "Free Delivery Across India",
                ]
              )
            }
          >
            Get Monthly Combo (₹2,599) →
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pricing-trust-bar">
          <div className="trust-item">
            <span className="trust-icon">🚚</span>
            <div>
              <strong>Pan-India Fast Courier</strong>
              <p>Delivered to your shop doorstep</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <div>
              <strong>Secure UPI / Card / COD</strong>
              <p>GPay, PhonePe, Paytm, RuPay, NetBanking</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🔋</span>
            <div>
              <strong>Rechargeable Battery Printer</strong>
              <p>Continuous wireless mobile billing</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">💬</span>
            <div>
              <strong>WhatsApp Support</strong>
              <p>
                <a
                  href="https://wa.me/919446960834?text=Hi%20QuickBill%20POS%20Team,%20I%20need%20assistance%20with%20POS%20setup"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#16a34a", fontWeight: 700 }}
                >
                  +91 9446960834 ↗
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout / Order Activation Modal */}
      {checkoutItem && (
        <div className="receipt-overlay" onClick={() => setCheckoutItem(null)}>
          <div
            className="receipt-modal animate-slide-up"
            style={{
              width: "min(480px, 100%)",
              background: "#ffffff",
              borderRadius: 22,
              padding: 24,
              boxShadow: "var(--shadow-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <span className="kicker" style={{ fontSize: 11, padding: "2px 8px" }}>
                  {checkoutItem.type.toUpperCase()} ORDER / ACTIVATION
                </span>
                <h3 style={{ margin: "4px 0 0", fontSize: 20 }}>{checkoutItem.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutItem(null)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid var(--line)", borderRadius: 14, padding: "14px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Total Order Value:</span>
                <span style={{ fontSize: 26, fontWeight: 850, color: "var(--primary)" }}>
                  ₹{checkoutItem.price}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                Package: {checkoutItem.billingPeriod}
              </div>
              {checkoutItem.savings && (
                <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", marginTop: 4 }}>
                  🎉 {checkoutItem.savings}
                </div>
              )}
            </div>

            {/* Package Includes List */}
            {checkoutItem.includes.length > 0 && (
              <div style={{ background: "#eff6ff", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 12.5 }}>
                <strong style={{ color: "#1e40af", display: "block", marginBottom: 4 }}>What you get:</strong>
                <ul style={{ margin: 0, paddingLeft: 18, color: "#1e3a8a" }}>
                  {checkoutItem.includes.map((inc, i) => (
                    <li key={i}>{inc}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Merchant Details Inputs */}
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="modalShopName" style={{ fontSize: 12.5, margin: "0 0 4px" }}>
                Shop / Business Name
              </label>
              <input
                id="modalShopName"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Ramesh Kirana & General Store"
                style={{ marginBottom: 8, padding: "9px 12px" }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label htmlFor="modalPhone" style={{ fontSize: 12.5, margin: "0 0 4px" }}>
                    WhatsApp Mobile No. *
                  </label>
                  <input
                    id="modalPhone"
                    type="tel"
                    value={merchantPhone}
                    onChange={(e) => setMerchantPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    style={{ padding: "9px 12px" }}
                  />
                </div>
                <div>
                  <label htmlFor="modalCity" style={{ fontSize: 12.5, margin: "0 0 4px" }}>
                    City / Pin Code
                  </label>
                  <input
                    id="modalCity"
                    value={merchantCity}
                    onChange={(e) => setMerchantCity(e.target.value)}
                    placeholder="e.g. Mumbai, 400001"
                    style={{ padding: "9px 12px" }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleWhatsAppDirect}
                style={{ width: "100%", background: "#25D366", borderColor: "#1ebd5a" }}
              >
                💬 Order / Activate via WhatsApp (Fast Response) →
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSubmitted(true);
                  setTimeout(() => setCheckoutItem(null), 1800);
                }}
              >
                {submitted ? "✓ Order Submitted! Our team is contacting you..." : "Submit Order Online (Pay via UPI / COD)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
