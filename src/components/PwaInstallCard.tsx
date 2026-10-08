import React, { useEffect, useState } from "react";

export default function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt event (Chrome, Edge, Android, Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(!showIosGuide);
    } else {
      // Fallback for browsers: prompt user to use browser install menu or open Web POS
      window.open("https://posquickbill.vercel.app/", "_blank");
    }
  };

  return (
    <div className="pwa-install-wrapper" id="pwa">
      <div className="pwa-install-card">
        <div className="pwa-install-header">
          <div className="pwa-badge-icon">📲</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="pwa-kicker">PROGRESSIVE WEB APP (PWA)</span>
              <span className="pwa-tag-pill">All Devices Supported</span>
            </div>
            <h3 className="pwa-title">Install QuickBill POS on Any Device</h3>
            <p className="pwa-desc">
              Run QuickBill POS as a native standalone app on <strong>Android, iPhone, iPad, Windows PC, Mac & ChromeOS</strong> without app store downloads. 100% Offline-capable with instant counter launch.
            </p>
          </div>
        </div>

        {/* PWA Feature Highlights Grid */}
        <div className="pwa-features-grid">
          <div className="pwa-feat-item">
            <span className="pwa-feat-icon">⚡</span>
            <div>
              <strong>Instant App Launch</strong>
              <p>Opens in full screen with zero browser bars</p>
            </div>
          </div>
          <div className="pwa-feat-item">
            <span className="pwa-feat-icon">📶</span>
            <div>
              <strong>100% Offline First</strong>
              <p>Bills and prints without internet connectivity</p>
            </div>
          </div>
          <div className="pwa-feat-item">
            <span className="pwa-feat-icon">💾</span>
            <div>
              <strong>Ultra-Lightweight</strong>
              <p>Under 2MB storage, saves mobile memory</p>
            </div>
          </div>
          <div className="pwa-feat-item">
            <span className="pwa-feat-icon">🔄</span>
            <div>
              <strong>Auto Updating</strong>
              <p>Always runs the latest release seamlessly</p>
            </div>
          </div>
        </div>

        {/* Install Actions Bar */}
        <div className="pwa-actions-bar">
          {isInstalled ? (
            <div className="pwa-installed-badge">
              ✓ QuickBill POS is installed on this device! Ready to bill offline.
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary pwa-install-btn"
                onClick={handleInstallClick}
              >
                📲 {deferredPrompt ? "Install App to This Device" : isIos ? "Install on iPhone / iPad" : "Install Web App (PWA)"}
              </button>

              <a
                href="https://posquickbill.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: "10px 18px", fontSize: 13.5 }}
              >
                Launch Web POS in Browser ↗
              </a>
            </>
          )}
        </div>

        {/* iOS installation instruction callout */}
        {showIosGuide && (
          <div className="pwa-ios-guide animate-slide-up">
            <strong>How to install on iPhone & iPad:</strong>
            <ol style={{ margin: "6px 0 0", paddingLeft: 20 }}>
              <li>Tap the <strong>Share</strong> button (⎙ with arrow) at the bottom of Safari.</li>
              <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> (➕).</li>
              <li>Tap <strong>&quot;Add&quot;</strong> at the top right. QuickBill POS will appear on your home screen!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
