import React, { useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}

const INDIAN_MENU_ITEMS = [
  // Beverages / Chai Bar
  { id: "i1", name: "Masala Cutting Chai", price: 20, category: "Chai & Drinks", emoji: "☕" },
  { id: "i2", name: "South Indian Filter Coffee", price: 30, category: "Chai & Drinks", emoji: "🧋" },
  { id: "i3", name: "Fresh Mango Lassi", price: 60, category: "Chai & Drinks", emoji: "🥛" },
  { id: "i4", name: "Cold Badam Milk", price: 50, category: "Chai & Drinks", emoji: "🧃" },

  // Snacks & Chaat
  { id: "i5", name: "Crispy Samosa (2 pcs)", price: 35, category: "Snacks & Chaat", emoji: "🥟" },
  { id: "i6", name: "Pani Puri / Golgappa", price: 40, category: "Snacks & Chaat", emoji: "🥣" },
  { id: "i7", name: "Paneer Grilled Sandwich", price: 90, category: "Snacks & Chaat", emoji: "🥪" },
  { id: "i8", name: "Masala Dosa with Chutney", price: 80, category: "Snacks & Chaat", emoji: "🥞" },

  // Sweets & Bakery
  { id: "i9", name: "Warm Gulab Jamun (2 pcs)", price: 50, category: "Bakery & Sweets", emoji: "🍯" },
  { id: "i10", name: "Kaju Katli (100g pack)", price: 120, category: "Bakery & Sweets", emoji: "🍬" },
  { id: "i11", name: "Fresh Veg Puff / Patties", price: 25, category: "Bakery & Sweets", emoji: "🥐" },
  { id: "i12", name: "Fruit Rusk & Cookies (250g)", price: 75, category: "Bakery & Sweets", emoji: "🍪" },

  // Kirana / Daily Essentials
  { id: "i13", name: "Atta Wheat Flour (1 Kg)", price: 48, category: "Kirana Daily", emoji: "🌾" },
  { id: "i14", name: "Tata Salt Pouch (1 Kg)", price: 28, category: "Kirana Daily", emoji: "🧂" },
  { id: "i15", name: "Amul Butter (100g)", price: 58, category: "Kirana Daily", emoji: "🧈" },
  { id: "i16", name: "Fortune Sunflower Oil (1L)", price: 145, category: "Kirana Daily", emoji: "🌻" },
];

export default function PosSimulator() {
  const [activeCategory, setActiveCategory] = useState<"All" | "Chai & Drinks" | "Snacks & Chaat" | "Bakery & Sweets" | "Kirana Daily">("All");
  const [cart, setCart] = useState<CartItem[]>([
    { id: "i1", name: "Masala Cutting Chai", price: 20, qty: 2, emoji: "☕" },
    { id: "i5", name: "Crispy Samosa (2 pcs)", price: 35, qty: 1, emoji: "🥟" },
  ]);
  const [currentTime, setCurrentTime] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [gstType, setGstType] = useState<"5" | "0">("5"); // 5% GST (2.5% CGST + 2.5% SGST) or 0% Composition
  const [printedReceipt, setPrintedReceipt] = useState<{
    ticketNo: number;
    items: CartItem[];
    subtotal: number;
    cgst: number;
    sgst: number;
    total: number;
    date: string;
    paymentMode: string;
    gstin: string;
  } | null>(null);
  const [heldOrders, setHeldOrders] = useState<CartItem[][]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live IST digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Soft audio beep using Web Audio API
  const playBeep = (freq = 920, duration = 0.07) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  const addToCart = (item: (typeof INDIAN_MENU_ITEMS)[0]) => {
    playBeep(980, 0.06);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1, emoji: item.emoji }];
    });
  };

  const addCustomAmount = () => {
    const val = parseFloat(customAmount);
    if (!val || val <= 0) return;
    playBeep(1100, 0.07);
    const customItem: CartItem = {
      id: `custom-${Date.now()}`,
      name: `Custom Item (₹${val})`,
      price: val,
      qty: 1,
      emoji: "🏷️",
    };
    setCart((prev) => [...prev, customItem]);
    setCustomAmount("");
  };

  const updateQty = (id: string, delta: number) => {
    playBeep(750, 0.05);
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    playBeep(600, 0.08);
    setCart([]);
  };

  const holdCart = () => {
    if (cart.length === 0) return;
    playBeep(820, 0.1);
    setHeldOrders((prev) => [...prev, cart]);
    setCart([]);
  };

  const recallCart = (index: number) => {
    playBeep(920, 0.1);
    const orderToRestore = heldOrders[index];
    setHeldOrders((prev) => prev.filter((_, i) => i !== index));
    setCart((prev) => [...prev, ...orderToRestore]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxRate = gstType === "5" ? 0.05 : 0;
  const cgst = subtotal * (taxRate / 2);
  const sgst = subtotal * (taxRate / 2);
  const total = subtotal + cgst + sgst;

  const handleCheckout = (mode: string) => {
    if (cart.length === 0) return;
    playBeep(1200, 0.12);
    setIsPrinting(true);

    const ticket = {
      ticketNo: Math.floor(1000 + Math.random() * 9000),
      items: [...cart],
      subtotal,
      cgst,
      sgst,
      total,
      date: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      paymentMode: mode,
      gstin: "29AABCB1234F1Z0",
    };

    setTimeout(() => {
      setPrintedReceipt(ticket);
      setIsPrinting(false);
      setCart([]);
    }, 600);
  };

  const filteredItems =
    activeCategory === "All"
      ? INDIAN_MENU_ITEMS
      : INDIAN_MENU_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="pos-simulator-wrapper" id="live-simulator">
      {/* Terminal Executive Header */}
      <div className="pos-sim-header">
        <div className="pos-sim-header-left">
          <div className="pos-sim-pill live">
            <span className="pos-pulse-dot" />
            INDIA LIVE COUNTER POS
          </div>
          <span className="pos-sim-desk-meta">REG #01 · GST READY · UPI INTEGRATED</span>
        </div>
        <div className="pos-sim-header-right">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Tax:</span>
            <button
              type="button"
              className="pos-sound-toggle"
              onClick={() => setGstType(gstType === "5" ? "0" : "5")}
              title="Toggle GST mode (5% GST vs Composition 0%)"
            >
              {gstType === "5" ? "GST 5% (CGST+SGST)" : "0% Non-GST / Composition"}
            </button>
          </div>
          <button
            type="button"
            className="pos-sound-toggle"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute audio beeps" : "Enable audio beeps"}
            aria-label="Toggle terminal audio feedback"
          >
            {soundEnabled ? "🔊 Sound On" : "🔇 Muted"}
          </button>
          <div className="pos-sim-clock">{currentTime || "12:00:00 PM"}</div>
        </div>
      </div>

      <div className="pos-sim-body">
        {/* Left Catalog / Item Touchpad */}
        <div className="pos-sim-catalog">
          {/* Indian Retail Category Tabs */}
          <div className="pos-sim-cat-tabs" style={{ flexWrap: "wrap" }}>
            {(["All", "Chai & Drinks", "Snacks & Chaat", "Bakery & Sweets", "Kirana Daily"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`pos-cat-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "All" && "✨ "}
                {cat === "Chai & Drinks" && "☕ "}
                {cat === "Snacks & Chaat" && "🥟 "}
                {cat === "Bakery & Sweets" && "🍬 "}
                {cat === "Kirana Daily" && "🌾 "}
                {cat}
              </button>
            ))}
          </div>

          {/* Touch Grid */}
          <div className="pos-sim-grid">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="pos-item-btn"
                onClick={() => addToCart(item)}
              >
                <div className="pos-item-emoji">{item.emoji}</div>
                <div className="pos-item-info">
                  <span className="pos-item-title">{item.name}</span>
                  <span className="pos-item-price">₹{item.price.toFixed(0)}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Fast Amount-First Entry for Kirana & Fast Counters */}
          <div className="pos-custom-bar">
            <div className="pos-custom-label">⚡ Direct Amount Keypad (नकद / खुला बिल):</div>
            <div className="pos-custom-input-group">
              <span className="pos-currency-symbol">₹</span>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustomAmount();
                }}
                className="pos-quick-input"
              />
              <button
                type="button"
                className="btn btn-outline pos-quick-add"
                onClick={addCustomAmount}
              >
                + Add ₹ Amount
              </button>
            </div>
            <div className="pos-quick-presets">
              {[10, 20, 50, 100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="pos-preset-chip"
                  onClick={() => {
                    playBeep(1000, 0.05);
                    setCart((prev) => [
                      ...prev,
                      {
                        id: `preset-${Date.now()}-${amt}`,
                        name: `Quick Sale (₹${amt})`,
                        price: amt,
                        qty: 1,
                        emoji: "💵",
                      },
                    ]);
                  }}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Held Orders Recall (Khata / Parked Customer) */}
          {heldOrders.length > 0 && (
            <div className="pos-held-strip">
              <span>⏸️ Parked Bills / होल्ड बिल ({heldOrders.length}):</span>
              <div className="pos-held-tags">
                {heldOrders.map((order, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="pos-held-btn"
                    onClick={() => recallCart(idx)}
                  >
                    Bill #{idx + 1} (₹{order.reduce((s, i) => s + i.price * i.qty, 0).toFixed(0)}) ↩
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Active Ticket / Billing Slip Stream */}
        <div className="pos-sim-cart">
          <div className="pos-cart-header">
            <h3>Current Bill ({cart.reduce((s, i) => s + i.qty, 0)} items)</h3>
            {cart.length > 0 && (
              <div className="pos-cart-actions">
                <button
                  type="button"
                  className="pos-cart-tool-btn"
                  onClick={holdCart}
                  title="Park bill and serve next customer"
                >
                  ⏸️ Hold Bill
                </button>
                <button
                  type="button"
                  className="pos-cart-tool-btn danger"
                  onClick={clearCart}
                  title="Clear bill"
                >
                  ✕ Clear
                </button>
              </div>
            )}
          </div>

          <div className="pos-cart-items">
            {cart.length === 0 ? (
              <div className="pos-empty-cart">
                <div style={{ fontSize: 32 }}>🛒</div>
                <strong>Billing Desk Ready</strong>
                <p>Tap items or enter an amount in ₹ to start instant billing.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pos-cart-row">
                  <div className="pos-cart-row-left">
                    <span className="pos-cart-row-emoji">{item.emoji}</span>
                    <div className="pos-cart-row-details">
                      <span className="pos-cart-name">{item.name}</span>
                      <span className="pos-cart-unit">₹{item.price.toFixed(0)} each</span>
                    </div>
                  </div>
                  <div className="pos-cart-row-right">
                    <div className="pos-qty-control">
                      <button
                        type="button"
                        className="pos-qty-btn"
                        onClick={() => updateQty(item.id, -1)}
                      >
                        -
                      </button>
                      <span className="pos-qty-num">{item.qty}</span>
                      <button
                        type="button"
                        className="pos-qty-btn"
                        onClick={() => updateQty(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="pos-cart-subtotal">
                      ₹{(item.price * item.qty).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Totals with GST Breakdown */}
          <div className="pos-cart-totals">
            <div className="pos-total-line">
              <span>Subtotal (सामान राशि)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {gstType === "5" ? (
              <>
                <div className="pos-total-line">
                  <span>CGST (2.5%)</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="pos-total-line">
                  <span>SGST (2.5%)</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="pos-total-line">
                <span>GST (Composition 0%)</span>
                <span>₹0.00</span>
              </div>
            )}
            <div className="pos-total-line grand">
              <span>Total Amount (कुल राशि)</span>
              <span className="pos-grand-amount">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Indian Payment Action Buttons (UPI, Cash, Card) */}
          <div className="pos-checkout-bar">
            <button
              type="button"
              className="pos-pay-btn"
              style={{ background: "#7c3aed", color: "#ffffff" }}
              disabled={cart.length === 0 || isPrinting}
              onClick={() => handleCheckout("UPI (GPay / PhonePe / Paytm)")}
            >
              📱 UPI QR (₹{total.toFixed(0)})
            </button>
            <button
              type="button"
              className="pos-pay-btn cash"
              disabled={cart.length === 0 || isPrinting}
              onClick={() => handleCheckout("Cash (नकद)")}
            >
              💵 Cash (नकद)
            </button>
            <button
              type="button"
              className="pos-pay-btn thermal"
              disabled={cart.length === 0 || isPrinting}
              onClick={() => handleCheckout("Print Receipt")}
            >
              🖨️ {isPrinting ? "Printing…" : "Thermal Bill"}
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Indian GST & UPI Thermal Receipt Output */}
      {printedReceipt && (
        <div className="receipt-overlay" onClick={() => setPrintedReceipt(null)}>
          <div
            className="receipt-modal animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="receipt-paper">
              <div className="receipt-top-tear" />
              <div className="receipt-inner">
                <div className="receipt-center">
                  <div className="receipt-logo">★ QUICKBILL POS INDIA ★</div>
                  <div className="receipt-sub">RETAIL TAX INVOICE / कर चालान</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e3a8a", margin: "2px 0" }}>
                    GSTIN: {printedReceipt.gstin}
                  </div>
                  <div className="receipt-date">{printedReceipt.date}</div>
                  <div className="receipt-ticket">BILL NO: #QB-IN-{printedReceipt.ticketNo}</div>
                </div>

                <div className="receipt-divider" />

                <div className="receipt-table">
                  {printedReceipt.items.map((it, idx) => (
                    <div key={idx} className="receipt-line-item">
                      <div className="receipt-item-desc">
                        <span>{it.qty}x</span> {it.name}
                      </div>
                      <div className="receipt-item-cost">
                        ₹{(it.price * it.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="receipt-divider" />

                <div className="receipt-summary">
                  <div className="receipt-sum-row">
                    <span>ITEM TOTAL</span>
                    <span>₹{printedReceipt.subtotal.toFixed(2)}</span>
                  </div>
                  {printedReceipt.cgst > 0 && (
                    <>
                      <div className="receipt-sum-row">
                        <span>CGST (2.5%)</span>
                        <span>₹{printedReceipt.cgst.toFixed(2)}</span>
                      </div>
                      <div className="receipt-sum-row">
                        <span>SGST (2.5%)</span>
                        <span>₹{printedReceipt.sgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="receipt-sum-row receipt-bold-total">
                    <span>NET PAYABLE</span>
                    <span>₹{printedReceipt.total.toFixed(2)}</span>
                  </div>
                  <div className="receipt-sum-row" style={{ marginTop: 4 }}>
                    <span>PAYMENT MODE</span>
                    <span style={{ fontWeight: 700, color: "#7c3aed" }}>
                      {printedReceipt.paymentMode.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="receipt-divider" />

                {/* Simulated UPI Scan QR on Receipt for Instant Customer Payment */}
                <div className="receipt-center" style={{ margin: "8px 0" }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=upi://pay?pa=quickbill@upi&pn=QuickBillRetail&am=${printedReceipt.total.toFixed(
                      2
                    )}&cu=INR&margin=2`}
                    alt="UPI Payment QR Code"
                    width={90}
                    height={90}
                    style={{ margin: "0 auto", display: "block", borderRadius: 4 }}
                  />
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", marginTop: 4 }}>
                    SCAN & PAY VIA GPAY / PHONEPE / PAYTM
                  </div>
                </div>

                <div className="receipt-divider" />

                <div className="receipt-center receipt-footer-note">
                  <div className="receipt-thanks">धन्यवाद! THANK YOU FOR YOUR VISIT!</div>
                  <div className="receipt-tagline">100% OFFLINE BILLING BY QUICKBILL POS INDIA</div>
                </div>
              </div>
              <div className="receipt-bottom-tear" />
            </div>

            <div className="receipt-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPrintedReceipt(null)}
              >
                ✓ Next Bill / नया बिल
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  window.print();
                }}
              >
                🖨️ Physical Thermal Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
