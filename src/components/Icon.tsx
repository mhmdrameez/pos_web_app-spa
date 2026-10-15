import type { ReactNode } from "react";

const PATHS: Record<string, ReactNode> = {
  keypad: (
    <>
      <circle cx="6" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="6" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="18" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  offline: (
    <>
      <path d="M2 9a15.5 15.5 0 0 1 4.6-2.7M10.7 5.1A15.6 15.6 0 0 1 22 9" />
      <path d="M5.2 12.6a10.5 10.5 0 0 1 5-2.4M14.8 10.5a10.5 10.5 0 0 1 4 2.1" />
      <path d="M8.6 16.1a6 6 0 0 1 6.8 0" />
      <path d="M12 20h.01" />
      <path d="M3 3l18 18" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-2-1.4L14 21l-2-1.4L10 21l-2-1.4L6 21z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v.01M17 20h4M20 17v.01" />
    </>
  ),
  hold: (
    <>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </>
  ),
  history: (
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5" />
      <path d="M4 4v4.5h4.5" />
      <path d="M12 8v4.5l3 1.8" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V3h10v6" />
      <rect x="3.5" y="9" width="17" height="8" rx="2" />
      <path d="M7 14h10v7H7z" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  download: (
    <>
      <path d="M12 4v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9.5L5 20v-4H4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </>
  ),
};

type Props = {
  name: keyof typeof PATHS;
  size?: number;
  className?: string;
};

export default function Icon({ name, size = 22, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
