# QuickBill POS — marketing SPA + APK releases

Single-page marketing site for **QuickBill POS** (web, offline-first billing desk) and **App-POS (QuickBillPoss)** (React Native, SQLite, Cloud Firestore, ESC/POS). Developers publish Android APKs at `/apk-upload`; the homepage always shows the latest release and its download size.

## Run locally

```bash
npm install
npm run dev
```

- Marketing site: http://127.0.0.1:5173
- Developer upload: http://127.0.0.1:5173/apk-upload
- API: http://127.0.0.1:8787

Production (after `npm run build`): `npm start` serves the SPA and APIs on port 8787.

## Developer login

Set in `.env` (see `.env.example`):

- User ID: `ADMIN_USER` (default `developer`)
- Password: `ADMIN_PASSWORD`

Sign in at `/apk-upload`, choose an APK, enter a version (for example `1.0.4`). File size is measured from the upload and listed with each release. The newest upload is the **latest** APK on the public page.

APKs are stored in `uploads/apks`. Metadata is in `data/releases.json`.
