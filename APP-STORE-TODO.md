# 🍏 App Store TODO

The game is **done and live** at https://maximstark.github.io/paint-by-numbers/.
This is the remaining work to publish it to the **Apple App Store** — to be done later.
Full step-by-step details are in **[MOBILE.md](MOBILE.md)**; this is the short checklist.

## ✅ Already done (no action needed)
- [x] App built, 8 characters, installable PWA, offline support
- [x] App icon **1024×1024, alpha-free** (Apple requires) — `icons/icon-1024.png`
- [x] Capacitor config + build scripts (`capacitor.config.json`, `package.json`, `tools/build-www.js`)
- [x] Capacitor icon/splash sources — `resources/` (via `tools/gen-icons.js`)
- [x] Privacy policy — live at https://maximstark.github.io/paint-by-numbers/privacy.html
- [x] Free + Buy Me a Coffee support link (parental-gated, Kids-category safe)
- [x] Listing text drafted (see MOBILE.md)

## 0. Decide first
- [ ] **Check the old MacBook's macOS version** (Apple menu → About This Mac). This picks the path:
  - New enough for Apple's current-required Xcode → **Path A** (build on the Mac)
  - Too old → **Path B** (free GitHub Actions cloud build; Mac not needed to build)
- [ ] **Free vs paid** — recommended: **free** (pairs with "no ads, no tracking, open source")
- [ ] **Category** — Games (Family/Educational), or also list in **Kids** (stricter but higher trust)

## 1. Apple account (browser — any computer, ~1 hr + Apple's processing)
- [ ] Enroll in the **Apple Developer Program** ($99/yr) — developer.apple.com/programs
- [ ] In **App Store Connect**, create the app: name "Paint by Numbers", bundle id
      `com.maximstark.paintbynumbers`, an SKU
- [ ] Fill **App Privacy** → answer **"Data Not Collected"** for everything
- [ ] Paste the **listing** (from MOBILE.md) + set Privacy Policy URL (already live) + Support URL (the repo)

## 2. Screenshots
- [ ] Provide screenshots at required sizes: **6.7" iPhone 1290×2796**, and **12.9" iPad 2048×2732**
      (if offering iPad). Capture from the Xcode Simulator **or ask Claude to generate them from the art.**

## 3. Build & upload
### Path A — Mac can run current Xcode (simplest)
- [ ] `git clone` the repo, then `npm install`
- [ ] `npm run ios:add` → `npm run ios:assets` → `npm run ios:open`
- [ ] In Xcode: set **Team/signing**, Version `1.0` Build `1`, then **Product → Archive → Distribute → Upload**

### Path B — Mac too old → free cloud build
- [ ] Create an **App Store Connect API key** (App Store Connect → Users and Access → Integrations)
- [ ] Create a **distribution certificate + provisioning profile** (or let Fastlane make them)
- [ ] Add them as **GitHub repo secrets**; rename `.github/workflows/ios-build.yml.example` → `.yml`
- [ ] **Ask Claude to finish wiring the signing + upload steps** in that workflow

## 4. Submit
- [ ] Attach the uploaded build to the version, add screenshots, **Submit for Review**
- [ ] Respond to any review notes; then release 🎉

---
**Claude can help when you resume:** generate the App Store screenshots, wire up the Path B CI
pipeline end-to-end, and add more characters. Just say so.
