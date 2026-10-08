import React, { useState } from "react";

export default function LiveWebPosEmbed() {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(1);

  const reloadIframe = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="live-pos-embed-wrapper" id="live-pos-app">
      {/* Sleek Browser / POS Terminal Header Bar */}
      <div className="live-pos-embed-header">
        <div className="live-pos-window-dots">
          <span className="window-dot dot-red" />
          <span className="window-dot dot-yellow" />
          <span className="window-dot dot-green" />
          <span className="live-pos-header-status">
            <span className="pos-pulse-dot" />
            LIVE WEB POS DESK
          </span>
        </div>

        <div className="live-pos-address-bar">
          <span className="live-pos-lock-icon">🔒</span>
          <span className="live-pos-url-text">https://posquickbill.vercel.app/</span>
          <span className="live-pos-tag-pill">Active Live Web App</span>
        </div>

        <div className="live-pos-header-actions">
          <button
            type="button"
            className="live-pos-tool-btn"
            onClick={reloadIframe}
            title="Reload Web POS Desk"
            aria-label="Reload Web POS Desk"
          >
            ↻ Reload
          </button>
          <a
            href="https://posquickbill.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="live-pos-launch-btn"
            title="Open Web POS in New Fullscreen Window"
          >
            Open Fullscreen ↗
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="live-pos-frame-container">
        {isLoading && (
          <div className="live-pos-loading-overlay">
            <div className="live-pos-spinner" />
            <p style={{ marginTop: 14, fontWeight: 700, color: "var(--navy)" }}>
              Connecting to Live QuickBill Web POS Desk…
            </p>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              Loading offline-first billing interface from posquickbill.vercel.app
            </span>
          </div>
        )}

        <iframe
          key={iframeKey}
          src="https://posquickbill.vercel.app/"
          title="QuickBill Web POS Live Application"
          className="live-pos-iframe"
          onLoad={() => setIsLoading(false)}
          allow="clipboard-write; bluetooth; usb; payment"
          loading="lazy"
        />
      </div>

      {/* Bottom Information / Quick Help Strip */}
      <div className="live-pos-bottom-strip">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
            ⚡ Fully Functional Web POS:
          </span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            Tap menu items, enter ₹ amounts, compute GST & discounts, and simulate real thermal receipts directly above.
          </span>
        </div>

        <a
          href="https://posquickbill.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}
        >
          Launch Full Window ↗
        </a>
      </div>
    </div>
  );
}
