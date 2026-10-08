import React, { useState } from "react";
import type { Release } from "../api";

interface Props {
  release: Release | null;
}

export default function DownloadQrCard({ release }: Props) {
  const [copied, setCopied] = useState(false);

  if (!release) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    release.downloadUrl
  )}&margin=4`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(release.downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="apk-qr-card">
      <div className="apk-qr-code-wrap">
        <img
          src={qrImageUrl}
          alt={`Scan QR Code to download QuickBillPoss ${release.version}`}
          width={140}
          height={140}
          className="apk-qr-img"
          loading="lazy"
        />
        <span className="apk-qr-scan-badge">📷 Phone / Scanner से स्कैन करें</span>
      </div>

      <div className="apk-qr-info">
        <div className="apk-qr-tags">
          <span className="apk-badge-version">{release.version}</span>
          <span className="apk-badge-size">{release.sizeLabel}</span>
          <span className="apk-badge-arch">ARM64-v8a</span>
          <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>
            🇮🇳 India Edition
          </span>
        </div>

        <h4 className="apk-qr-title">Instant Mobile & POS Device Install</h4>
        <p className="apk-qr-desc">
          Point your Android phone, tablet, or Sunmi / Pine Labs POS camera to directly download and install{" "}
          <strong>{release.fileName}</strong>. Works completely offline with local Bluetooth thermal printers.
        </p>

        <div className="apk-qr-actions">
          <a
            className="btn btn-primary"
            href={release.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Direct Download APK ({release.sizeLabel})
          </a>
          <button
            type="button"
            className="btn btn-outline"
            onClick={copyLink}
            title="Copy direct APK download URL to clipboard"
          >
            {copied ? "✓ Link Copied!" : "📋 Copy APK Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
