export type Faq = { q: string; a: string };
export type Step = { name: string; text: string };

export const HOME_FAQS: Faq[] = [
  {
    q: "Do I need internet to bill my customers?",
    a: "No. Every bill is saved on your phone or tablet, so billing keeps working when the network is down or the router restarts. Connect now and then so the app can sync and check your subscription.",
  },
  {
    q: "Can customers pay by UPI?",
    a: "Yes. A QR code with the exact bill amount shows on your screen and prints on the bill. Customers can scan it with Google Pay, PhonePe, Paytm, BHIM or any other UPI app.",
  },
  {
    q: "Does it handle GST?",
    a: "Yes. Choose 5%, 12% or 18%, and the bill shows CGST and SGST separately with your GSTIN. If you are unregistered or on the Composition Scheme, set the rate to 0%. Check with your CA for your exact filing needs.",
  },
  {
    q: "Which printers work with it?",
    a: "Standard ESC/POS thermal printers over Bluetooth, in 58 mm (2-inch) and 80 mm (3-inch) paper. That covers most portable pocket printers. There are no drivers to install.",
  },
  {
    q: "How much does it cost?",
    a: "₹99 a month, or ₹999 a year (that is about ₹83 a month). You can also buy the annual kit for ₹3,199, which includes a Bluetooth printer, a year of the app and five paper rolls. Bills are unlimited on every plan.",
  },
  {
    q: "Which phones and tablets can I use?",
    a: "Android phones, tablets and POS handhelds running Android 7.0 or newer. The app is built for 64-bit (arm64-v8a) devices, which is almost every current Android phone and tablet.",
  },
  {
    q: "Where is my sales data stored?",
    a: "On your own device first. If you sign in and turn on optional cloud sync, your records are backed up to Google Firebase. We never sell your data. The full details are in our Privacy Policy.",
  },
];

export const HOME_STEPS: Step[] = [
  {
    name: "Install the app",
    text: "Download it, open the file, and allow the install if Android asks. It is about 30 MB.",
  },
  {
    name: "Add your shop",
    text: "Enter your shop name, GST rate and UPI ID. Add a few items, or skip that and just type amounts.",
  },
  {
    name: "Start billing",
    text: "Type the amount, tap Add, then Pay. Pair a Bluetooth printer if you want a paper bill.",
  },
];

export const HOME_FEATURE_LIST: string[] = [
  "Amount-first keypad: type the rupee amount and tap Add",
  "Works offline: bills are saved on the device",
  "GST bills with CGST and SGST and your GSTIN",
  "UPI QR with the exact bill amount, on screen and on the printed bill",
  "Hold a bill and bring it back later",
  "Prints on 58 mm and 80 mm Bluetooth ESC/POS thermal printers",
  "Sales history with Cash, UPI, Card and Split filters, and bill reprint",
  "Export sales and inventory to Excel or CSV",
];
