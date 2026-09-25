# QuickBill POS — Marketing SPA + GitHub APK Releases

100% Frontend Single-Page Application (SPA) for **QuickBill POS** and **App-POS (QuickBillPoss)**. Designed to deploy effortlessly to **Vercel** with **zero backend server or database needed**.

APKs are hosted and distributed worldwide via **GitHub Releases** (`mhmdrameez/pos_web_app-spa`), providing unlimited storage, fast CDN downloads, and automatic changelog / fix notes.

## Run Locally

```bash
npm install
npm run dev
```

- Marketing site: http://localhost:5173
- Developer APK Console: http://localhost:5173/apk-upload

## Deploy to Vercel

1. Push your changes to GitHub.
2. In Vercel, import the repository (`mhmdrameez/pos_web_app-spa`).
3. Click **Deploy**.
4. That's it! Because it is a 100% frontend SPA, it runs directly on Vercel without any backend server.

## Publishing APK Releases

Navigate to `/apk-upload`:

1. **Enter the Version** (e.g. `1.0.4` or `v1.0.4`).
2. **Enter the Fixes / Changelog** (e.g., thermal receipt print fixes, offline SQLite fixes).
3. **Select your APK file** to verify the filename and file size.
4. Click **🚀 1-Click Publish to GitHub Releases**:
   - Opens GitHub's release creator with the version tag, title, and fix notes already filled in.
   - Drag and drop your `.apk` file into GitHub and click **Publish release**.
5. Once published, your new build appears immediately on both `/apk-upload` and the homepage download banner!
