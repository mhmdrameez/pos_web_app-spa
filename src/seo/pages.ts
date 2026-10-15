import type { Faq, Step } from "./content";

export type GuideSection = { h2: string; body?: string[]; bullets?: string[] };

export type LandingPageData = {
  slug: string;
  navTitle: string;
  kicker: string;
  seoTitle: string;
  description: string;
  h1: string;
  lead: string;
  cardBlurb: string;
  sections: GuideSection[];
  howTo?: { name: string; steps: Step[] };
  faqs: Faq[];
  related: string[];
  keywords: string[];
};

export const LANDING_PAGES: LandingPageData[] = [
  {
    slug: "gst-billing-app",
    navTitle: "GST billing app",
    kicker: "GST billing",
    seoTitle: "GST Billing App for Small Shops in India | QuickBill POS",
    description:
      "Make GST bills with CGST and SGST on your Android phone. Print them on a Bluetooth printer and keep billing even when the internet is down. From ₹99 a month.",
    h1: "A GST billing app for small shops that works offline",
    lead: "QuickBill POS adds GST to every bill, shows CGST and SGST separately, prints your GSTIN, and keeps working when the internet is down. It runs on the Android phone or tablet you already own, from ₹99 a month.",
    cardBlurb: "CGST and SGST on every bill, your GSTIN on the printout, and a 0% setting if you are unregistered.",
    sections: [
      {
        h2: "What a GST bill usually needs",
        body: [
          "A GST tax invoice from a registered shop normally shows the shop name and GSTIN, an invoice number and date, the items sold with their prices, the tax rate, and the tax amount. For a sale inside your own state, the tax is split into CGST and SGST.",
          "Exact requirements depend on your type of business and turnover, so confirm them with your CA. QuickBill POS is a billing tool. It does not give tax advice and it does not file your returns.",
        ],
      },
      {
        h2: "How QuickBill POS handles GST",
        body: ["You set your GST details once in Settings, and every bill after that is calculated for you."],
        bullets: [
          "Choose the GST rate that applies to your items.",
          "CGST and SGST are shown as separate lines on the bill.",
          "Your GSTIN prints on the bill.",
          "Every bill gets its own invoice number, so you can find it and reprint it later.",
          "Sales history can be exported to Excel or CSV for your accountant.",
        ],
      },
      {
        h2: "If you are unregistered or on the Composition Scheme",
        body: [
          "Shops that are not registered for GST, and shops on the Composition Scheme, do not collect GST from customers. In QuickBill POS you can set the GST rate to 0% so the bill shows only the item total.",
          "Composition dealers normally issue a bill of supply rather than a tax invoice. Check with your CA which document you should be giving your customers.",
        ],
      },
      {
        h2: "Quick at the counter",
        body: [
          "Type the amount, tap Add, tap Pay. The tax is worked out for you, the customer can pay by cash, UPI or card, and the bill prints in seconds on a 58 mm or 80 mm Bluetooth thermal printer. If the network is down, nothing changes.",
        ],
      },
    ],
    howTo: {
      name: "How to make a GST bill with QuickBill POS",
      steps: [
        { name: "Add your shop details", text: "Open Settings and enter your shop name and GSTIN." },
        { name: "Set the GST rate", text: "Choose the rate that applies to your items, or 0% if you are unregistered." },
        { name: "Add the items", text: "Type the amount and tap Add, or pick saved items from your list." },
        { name: "Take payment", text: "Tap Pay and choose Cash, UPI or Card." },
        { name: "Print the bill", text: "Print on your Bluetooth thermal printer, or reprint it later from History." },
      ],
    },
    faqs: [
      {
        q: "Does QuickBill POS show CGST and SGST separately?",
        a: "Yes. Each bill shows CGST and SGST as separate lines, with your GSTIN printed on it.",
      },
      {
        q: "Can I use it if I am not registered for GST?",
        a: "Yes. Set the GST rate to 0% and the bill shows only the item total.",
      },
      {
        q: "Can I give my accountant my sales data?",
        a: "Yes. You can export your sales history to Excel or CSV files from the app.",
      },
      {
        q: "Does it file my GST returns?",
        a: "No. QuickBill POS makes and stores your bills. Filing returns is done on the GST portal or by your accountant.",
      },
      {
        q: "How much does it cost?",
        a: "₹99 a month or ₹999 a year, with unlimited bills.",
      },
    ],
    related: ["offline-billing-app", "upi-qr-billing", "bluetooth-thermal-printer-billing-app"],
    keywords: ["GST billing app", "GST bill maker Android", "CGST SGST billing", "GST invoice app for shop"],
  },
  {
    slug: "offline-billing-app",
    navTitle: "Offline billing app",
    kicker: "Offline billing",
    seoTitle: "Offline Billing App for Shops | QuickBill POS",
    description:
      "A billing app that works with no internet. Bills are saved on your phone or tablet, so router restarts and weak signal never stop your counter. From ₹99 a month.",
    h1: "An offline billing app that never waits for the network",
    lead: "QuickBill POS saves every bill on your own phone or tablet. When the broadband drops, the router restarts or mobile data is weak, you keep billing.",
    cardBlurb: "Every bill is saved on your device, so a network drop never stops a sale.",
    sections: [
      {
        h2: "Why billing should not depend on the network",
        body: [
          "A shop counter is busiest exactly when things go wrong: the evening rush, a router restart, a patchy 4G signal. A billing app that needs a live connection stops when the connection does, and the queue grows.",
          "QuickBill POS is built local-first. The app keeps its own database on your device, so the connection is never in the way of a sale.",
        ],
      },
      {
        h2: "What works without internet",
        bullets: [
          "Making bills with the amount keypad or saved items",
          "GST calculation with CGST and SGST",
          "Holding a bill and bringing it back later",
          "Printing to a Bluetooth thermal printer",
          "Looking up sales history and reprinting a bill",
        ],
      },
      {
        h2: "What does need a connection",
        body: [
          "Signing in, optional cloud sync and checking your subscription use the internet. Connect now and then so the app can sync and confirm your plan. Everything else carries on without it.",
        ],
      },
      {
        h2: "Keep your own backup",
        body: [
          "Your data lives on the device, so back it up. QuickBill POS can export your sales and inventory to Excel or JSON files that you can save somewhere safe.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does QuickBill POS work with no internet at all?",
        a: "Yes, for everyday billing. You can make bills, hold them, print them and look back at your history without a connection. The app needs a connection from time to time to sync and check your subscription.",
      },
      {
        q: "Where are my bills stored?",
        a: "On your device, in a local database. If you sign in and turn on optional cloud sync, they are also backed up to Google Firebase.",
      },
      {
        q: "What happens if I lose my phone?",
        a: "Bills stored only on that device would be lost unless you exported a backup or turned on cloud sync. We recommend regular exports.",
      },
      {
        q: "Do I need the internet to install it?",
        a: "You need a connection to download the app. After that, you can bill offline.",
      },
      {
        q: "Does printing work offline?",
        a: "Yes. Bluetooth printing is between your phone and the printer, so no internet is needed.",
      },
    ],
    related: ["gst-billing-app", "billing-app-for-kirana-store", "bluetooth-thermal-printer-billing-app"],
    keywords: ["offline billing app", "billing software without internet", "offline POS app India"],
  },
  {
    slug: "upi-qr-billing",
    navTitle: "UPI QR billing",
    kicker: "UPI QR billing",
    seoTitle: "UPI QR Billing App for Shops | QuickBill POS",
    description:
      "Show a UPI QR with the exact bill amount on screen and print it on every thermal bill. Customers pay with Google Pay, PhonePe, Paytm or BHIM. From ₹99 a month.",
    h1: "Show a UPI QR on screen and print it on every bill",
    lead: "QuickBill POS shows a UPI QR code with the exact bill amount on your screen and prints it on the bill. Customers scan it with Google Pay, PhonePe, Paytm, BHIM or any other UPI app.",
    cardBlurb: "A QR with the exact amount on screen and on the printed bill, for any UPI app.",
    sections: [
      {
        h2: "Why a QR on the bill helps",
        body: [
          "Reading out a UPI number and waiting for the customer to type it is slow, and a wrong digit means a wrong payment. A QR that already holds your UPI ID and the bill amount removes both problems.",
          "Printing the QR on the bill also helps with home delivery and van sales: the customer can pay from the paper in their hand.",
        ],
      },
      {
        h2: "Set up and use",
        bullets: [
          "Add your UPI ID in Settings once.",
          "At the counter, build the bill and tap Pay.",
          "Choose UPI. The QR with the exact amount appears on screen.",
          "Or print the bill with the QR for the customer to scan.",
          "Check the payment alert on your UPI app or soundbox before handing over the goods, as you normally would.",
        ],
      },
      {
        h2: "Know what was paid how",
        body: [
          "Every bill records whether it was paid by Cash, UPI, Card or Split. At closing time you can filter your sales history by payment mode and match it against your drawer and your bank account.",
        ],
      },
      {
        h2: "Works with every UPI app",
        body: [
          "The QR uses the standard UPI format, so it works with any UPI app, not just one. QuickBill POS does not charge per bill. Plans are ₹99 a month or ₹999 a year.",
        ],
      },
    ],
    howTo: {
      name: "How to take a UPI payment with QuickBill POS",
      steps: [
        { name: "Add your UPI ID", text: "Enter your UPI ID once in Settings." },
        { name: "Make the bill", text: "Type the amount or pick items, then tap Pay." },
        { name: "Choose UPI", text: "The QR code with the exact bill amount appears on your screen." },
        { name: "Let the customer scan", text: "They scan it with any UPI app and approve the payment." },
        { name: "Confirm and print", text: "Check the payment alert, then print the bill." },
      ],
    },
    faqs: [
      {
        q: "Which UPI apps can customers use?",
        a: "Any UPI app: Google Pay, PhonePe, Paytm, BHIM and others.",
      },
      {
        q: "Does the QR include the bill amount?",
        a: "Yes. The QR is made for the exact total of that bill.",
      },
      {
        q: "Can the QR be printed on a thermal bill?",
        a: "Yes, on 58 mm and 80 mm paper.",
      },
      {
        q: "Does QuickBill POS charge a fee on UPI payments?",
        a: "No. We charge a flat plan price (₹99 a month or ₹999 a year) and nothing per bill. Your bank or UPI app's own terms still apply.",
      },
    ],
    related: ["gst-billing-app", "bluetooth-thermal-printer-billing-app", "billing-app-for-kirana-store"],
    keywords: ["UPI QR billing", "UPI QR on bill", "UPI billing app for shop", "QR code bill printing"],
  },
  {
    slug: "bluetooth-thermal-printer-billing-app",
    navTitle: "Bluetooth printer billing",
    kicker: "Thermal printing",
    seoTitle: "Bluetooth Thermal Printer Billing App | QuickBill POS",
    description:
      "Print GST bills with a UPI QR from your Android phone to any ESC/POS Bluetooth thermal printer, 58 mm or 80 mm. No drivers to install. From ₹99 a month.",
    h1: "Print bills on any ESC/POS Bluetooth thermal printer",
    lead: "QuickBill POS prints to standard ESC/POS thermal printers over Bluetooth, on 58 mm and 80 mm paper. There are no drivers to install.",
    cardBlurb: "58 mm and 80 mm, Bluetooth, standard ESC/POS. No drivers.",
    sections: [
      {
        h2: "58 mm or 80 mm?",
        body: [
          "58 mm (2-inch) rolls suit small pocket printers that you carry for delivery, van sales or a crowded counter. 80 mm (3-inch) rolls give a wider bill, which is more comfortable for GST invoices with longer item names.",
          "QuickBill POS lays the bill out for whichever roll you load, so you can switch printers without changing anything else.",
        ],
      },
      {
        h2: "How to choose a printer",
        bullets: [
          "Look for ESC/POS in the printer's specification. Most receipt printers support it.",
          "Choose a Bluetooth model. Small portable printers are the easiest to carry for delivery and van sales.",
          "For all-day use, check the battery capacity on portable models.",
          "Keep a spare paper roll of the right width.",
          "We can't test every model. If you are unsure, send us the model name on WhatsApp.",
        ],
      },
      {
        h2: "If it does not print",
        bullets: [
          "Check the battery and the paper roll. Thermal paper only prints on one side.",
          "Switch the printer off and on again.",
          "Pair it again in your phone's Bluetooth settings.",
          "Keep the printer close to the phone while printing.",
          "Make sure no other phone is connected to the same printer.",
        ],
      },
      {
        h2: "Don't have a printer yet?",
        body: [
          "The Annual Kit (₹3,199) includes a wireless Bluetooth thermal printer, a year of QuickBill POS and five paper rolls, delivered across India.",
        ],
      },
    ],
    howTo: {
      name: "How to connect a Bluetooth thermal printer to QuickBill POS",
      steps: [
        { name: "Switch on the printer", text: "Charge it, load the paper roll and turn it on." },
        { name: "Pair it", text: "Turn on Bluetooth on your phone and pair the printer." },
        { name: "Select it in the app", text: "Choose the printer in QuickBill POS." },
        { name: "Print a bill", text: "Make a bill and tap Print." },
      ],
    },
    faqs: [
      {
        q: "Which paper sizes does it support?",
        a: "58 mm (2-inch) and 80 mm (3-inch) thermal rolls.",
      },
      {
        q: "Do I need to install printer drivers?",
        a: "No. QuickBill POS uses the standard ESC/POS commands, so there is nothing to install.",
      },
      {
        q: "Will my printer work?",
        a: "If it supports ESC/POS, very likely. We can't guarantee every model, so message us the model name on WhatsApp and we will tell you.",
      },
      {
        q: "Where can I get a printer?",
        a: "The Annual Kit (₹3,199) includes a Bluetooth thermal printer, a year of the app and five paper rolls.",
      },
    ],
    related: ["upi-qr-billing", "gst-billing-app", "billing-app-for-cafe-and-bakery"],
    keywords: ["Bluetooth thermal printer billing app", "ESC/POS billing app Android", "58mm 80mm thermal printer app"],
  },
  {
    slug: "billing-app-for-kirana-store",
    navTitle: "Billing app for kirana stores",
    kicker: "For kirana stores",
    seoTitle: "Billing App for Kirana Stores | QuickBill POS",
    description:
      "A simple billing app for kirana stores. Type the amount for loose items, hold bills, add GST and UPI QR, and print on thermal paper. Works offline. From ₹99 a month.",
    h1: "A billing app made for the kirana counter",
    lead: "Most kirana items don't have a barcode, and the queue does not wait. QuickBill POS lets you type the amount, tap Add and print the bill, on the Android phone you already own, with or without internet.",
    cardBlurb: "Type the amount for loose items, hold bills, add GST and UPI QR, and print.",
    sections: [
      {
        h2: "Loose items and packaged goods",
        body: [
          "Type the rupee amount for loose items like sugar, rice or vegetables and tap Add. For things you sell every day, save them as items and pick them with one tap.",
          "Add as many lines as the customer needs, then tap Pay.",
        ],
      },
      {
        h2: "Built for a busy counter",
        bullets: [
          "Hold a bill when a customer goes to fetch something, and serve the next person.",
          "Attach a customer's name and phone to a bill when you want to keep track.",
          "Show or print a UPI QR for the exact amount.",
          "Print on a 58 mm or 80 mm thermal roll.",
          "Look up any bill later and reprint it.",
        ],
      },
      {
        h2: "An example bill",
        body: [
          "For illustration: tea powder 250 g at ₹120, sugar 2 kg at ₹90 and atta 5 kg at ₹190 make ₹400. With 5% GST split into CGST and SGST, the bill totals ₹420.00, and the customer scans the QR on the screen to pay.",
        ],
      },
      {
        h2: "Simple pricing",
        body: [
          "₹99 a month or ₹999 a year, with unlimited bills. It runs on the Android phone or tablet you already have, and the Annual Kit adds a Bluetooth printer if you need one.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do I need a barcode scanner?",
        a: "No. Type the amount or pick saved items. If you want to scan barcodes, the app can use your phone camera.",
      },
      {
        q: "Can I use my old Android phone?",
        a: "If it runs Android 7.0 or newer and is 64-bit, yes. Almost every current Android phone and tablet is.",
      },
      {
        q: "Does it work when the internet is down?",
        a: "Yes. Bills are saved on your device, so billing carries on without a connection.",
      },
      {
        q: "Can I add GST to my bills?",
        a: "Yes. Choose your GST rate and the bill shows CGST and SGST. If you are unregistered, set it to 0%.",
      },
      {
        q: "Can I keep a list of my items and prices?",
        a: "Yes. Add items in Products and pick them at billing.",
      },
    ],
    related: ["offline-billing-app", "gst-billing-app", "upi-qr-billing"],
    keywords: ["billing app for kirana store", "billing software for general store", "kirana shop billing app"],
  },
  {
    slug: "billing-app-for-cafe-and-bakery",
    navTitle: "Billing app for cafés and bakeries",
    kicker: "For cafés and bakeries",
    seoTitle: "Billing App for Cafes and Bakeries | QuickBill POS",
    description:
      "Fast counter billing for cafés, bakeries and takeaway shops. Hold orders, add GST, show a UPI QR, print on thermal paper and see the day's sales. From ₹99 a month.",
    h1: "Fast counter billing for cafés and bakeries",
    lead: "When there is a queue for coffee or cakes, every second counts. QuickBill POS gets a bill out in a few taps, holds orders while you serve the next person, and prints on a thermal roll.",
    cardBlurb: "Hold orders, apply coupons, add GST, show a UPI QR and see the day's sales by payment mode.",
    sections: [
      {
        h2: "Speed when the queue is long",
        body: [
          "Save your menu items with prices and pick them with one tap, or type an amount for a custom order. Tap Pay, choose Cash, UPI or Card, and print.",
        ],
      },
      {
        h2: "Hold orders and offer discounts",
        bullets: [
          "Hold a bill while a customer decides, then bring it back.",
          "Apply a coupon for an offer or discount.",
          "Add GST at the rate that applies, or 0%.",
          "Show a UPI QR for the exact amount.",
        ],
      },
      {
        h2: "Know your day",
        body: [
          "At closing, open History to see total sales, the number of bills and the average bill. Filter by Cash, UPI, Card or Split to match your drawer and your bank.",
        ],
      },
      {
        h2: "What it is, and what it is not",
        body: [
          "QuickBill POS is a counter billing app, a good fit for cafés, bakeries and takeaway shops. If you need table management or kitchen order tickets, message us on WhatsApp first so we can tell you honestly whether it fits.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I save my menu with prices?",
        a: "Yes. Add items in Products and pick them at billing.",
      },
      {
        q: "Does it print kitchen tickets?",
        a: "QuickBill POS is built for counter billing. Ask us on WhatsApp if you need kitchen tickets.",
      },
      {
        q: "Can I give discounts?",
        a: "Yes, using coupons.",
      },
      {
        q: "Does it work with weak Wi-Fi?",
        a: "Yes. Bills are saved on your device, so a weak connection does not slow a sale.",
      },
    ],
    related: ["bluetooth-thermal-printer-billing-app", "upi-qr-billing", "billing-app-for-kirana-store"],
    keywords: ["billing app for cafe", "bakery billing software", "cafe POS app India", "takeaway billing app"],
  },
];

export const getLandingPage = (slug: string) => LANDING_PAGES.find((p) => p.slug === slug);
