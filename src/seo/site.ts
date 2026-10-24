export const SITE = {
  origin: "https://www.quickbillpos.in",
  name: "QuickBill POS",
  locale: "en_IN",
  lang: "en-IN",
  ogImage: "/og-image.png",
  ogImageAlt:
    "QuickBill POS: offline billing app for Indian shops with GST bills, UPI QR and Bluetooth printing",
  phone: "+91-7907858474",
  whatsapp: "https://wa.me/917907858474",
  /** Bump when page content materially changes. Used for sitemap lastmod and schema dateModified. */
  updated: "2026-10-15",
};

export const PRICES = {
  monthly: 99,
  yearly: 999,
  starter: 2599,
  kit: 3199,
};

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE.origin}${path}`;
}
