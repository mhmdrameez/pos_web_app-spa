// Single place to edit the details that appear in both legal documents.
// Values wrapped in [square brackets] are shown highlighted on the page until replaced.
export const LEGAL = {
  entityName: "QuickBill POS",
  effectiveDate: "October 15, 2026",
  updatedDate: "October 15, 2026",
  effectiveIso: "2026-10-15",
  supportEmail: "support@quickbillpos.in",
  privacyEmail: "privacy@quickbillpos.in",
  legalEmail: "legal@quickbillpos.in",
};

export const isPlaceholder = (value: string) => value.trim().startsWith("[");
