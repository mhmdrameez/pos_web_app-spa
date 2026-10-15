export type Faq = { q: string; a: string };
export type Step = { name: string; text: string };

export interface Plan {
  tag: string;
  name: string;
  unit: string;
  blurb: string;
  was?: string;
  save?: string;
  features: string[];
  cta: string;
  note: string;
  /** Short list shown in the order dialog. */
  includes: string[];
}

export interface GuideStrings {
  home: string;
  getApp: string;
  fromMonth: string; // uses {price}
  askWa: string;
  chat: string;
  questions: string;
  keepReading: string;
  more: string;
  sideAria: string;
  perMonth: string;
  orYear: string; // uses {price}
  works: string;
  gstQr: string;
  print: string;
  seePlans: string;
}

/** The sample thermal bill. Item names and labels are written the way a shop in that region would print them. */
export interface ReceiptStrings {
  shop: string;
  gstin: string;
  bill: string;
  time: string;
  items: Array<{ name: string; price: string }>;
  subtotal: string;
  cgst: string;
  sgst: string;
  total: string;
  scan: string;
  thanks: string;
}

/**
 * All visible text for the home page and site chrome in one language.
 * Strings may contain **bold** segments (rendered by <Rich>).
 * Brand and technical terms (QuickBill POS, GST, UPI, QR, Bluetooth, ESC/POS, CGST, SGST) stay in Latin script.
 */
export interface Dict {
  meta: { title: string; description: string };
  nav: {
    how: string;
    features: string;
    pricing: string;
    faq: string;
    download: string;
    downloadSuffix: string;
    privacy: string;
    terms: string;
    skip: string;
    openMenu: string;
    closeMenu: string;
    homeAria: string;
    mainAria: string;
    language: string;
  };
  hero: {
    eyebrow: string;
    before: string;
    em: string;
    after: string;
    lede: string;
    altLine: string;
    micro: string[];
    deviceAlt: string;
    ctaDownload: string;
    ctaGet: string;
    ctaScan: string;
    ctaFallback: string;
    waMain: string;
    waSub: string;
  };
  facts: { aria: string; items: Array<{ title: string; text: string }> };
  how: { eyebrow: string; h2: string; sub: string; steps: Step[] };
  features: { eyebrow: string; h2: string; items: Array<{ title: string; body: string }> };
  history: { eyebrow: string; h2: string; sub: string; ticks: string[]; alt: string };
  printers: {
    eyebrow: string;
    h2: string;
    sub: string;
    specs: Array<{ k: string; v: string }>;
    asidePre: string;
    asideLink: string;
    asidePost: string;
  };
  guides: { eyebrow: string; h2: string; sub: string };
  faq: { eyebrow: string; h2: string; sub: string; ask: string; items: Faq[] };
  final: { h2: string; p: string; wa: string };
  bar: { download: string; get: string; waAria: string };
  pricing: {
    eyebrow: string;
    h2: string;
    sub: string;
    plans: Plan[];
    payPre: string;
    payPost: string;
    /** Subscription terms line; the Terms link sits between pre and post. */
    terms: { pre: string; post: string };
    modal: {
      order: string;
      close: string;
      shop: string;
      shopPh: string;
      phone: string;
      phonePh: string;
      city: string;
      cityPh: string;
      cont: string;
      fine: string;
    };
  };
  download: {
    eyebrow: string;
    h2: string;
    sub: string;
    version: string;
    size: string;
    released: string;
    needs: string;
    needsVal: string;
    btnMain: string;
    copy: string;
    copied: string;
    emptyLoaded: string;
    emptyLoading: string;
    askApp: string;
    installTitle: string;
    install: string[];
    qrAria: string;
    qrTitle: string;
    qrText: string;
    older: string;
    dl: string;
  };
  footer: {
    about: string;
    product: string;
    guides: string;
    help: string;
    legal: string;
    qa: string;
    whatsapp: string;
    built: string;
    admin: string;
    languages: string;
  };
  receipt: ReceiptStrings;
  guide: GuideStrings;
}
