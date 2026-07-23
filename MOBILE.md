# 📱 Publishing Paint by Numbers to the Apple App Store

This game is a web app, so we wrap it in a thin native shell with
[Capacitor](https://capacitorjs.com/) (open-source) and submit *that* to the App Store.
Everything here except the final build/upload can be done on Windows — the pieces are
already in the repo.

---

## ⚠️ First: the "old MacBook" reality check

Building and uploading an iOS app **requires a Mac running a recent Xcode**. This minimum
is set by **Apple**, not by us — every year or so Apple stops accepting apps built with
older Xcode versions. A genuinely old MacBook may be stuck on a macOS too old to install a
currently-accepted Xcode.

**Check your Mac:**  Apple menu → *About This Mac* → note the macOS version, then compare
against Apple's current minimum at
[developer.apple.com/ios](https://developer.apple.com/ios/) (look for "built with Xcode N").

- ✅ **Mac is new enough** → use **Path A** below (simplest).
- ❌ **Mac is too old** → the Mac can't build it, but you can still do everything: use
  **Path B** (a free cloud Mac in GitHub Actions builds and uploads for you). The old Mac
  is then only useful for the browser-based Apple account steps, which any computer can do.

Xcode is a big install (~7–15 GB) and needs a fair bit of RAM/disk, so if the Mac is both
old *and* small, lean toward Path B regardless.

---

## What's already prepared in this repo

- `capacitor.config.json` — app id `com.maximstark.paintbynumbers`, name, colors.
- `package.json` — scripts for the whole flow.
- `tools/build-www.js` — assembles a clean `www/` (web assets only) for Capacitor.
- `tools/gen-icons.js` — regenerates all icons + `resources/icon.png` (1024) and
  `resources/splash.png` (2732) that Apple/Capacitor need.
- `icons/icon-1024.png` — the App Store icon (already alpha-free, as Apple requires).
- `privacy.html` — a privacy policy (hosted at the URL below), required for kids' apps.

**Privacy policy URL:** `https://maximstark.github.io/paint-by-numbers/privacy.html`

---

## One-time Apple setup (do this in a browser, any computer)

1. **Enroll in the Apple Developer Program** — $99/year, at
   [developer.apple.com/programs](https://developer.apple.com/programs/). (Individual is fine.)
2. In [App Store Connect](https://appstoreconnect.apple.com) → **Apps → +** → create a new app:
   - Platform: iOS, Name: *Paint by Numbers* (must be unique on the store — have a backup name),
   - Bundle ID: create/select `com.maximstark.paintbynumbers` (or your own),
   - SKU: anything, e.g. `paintbynumbers`.
3. Fill in the **listing** (draft text at the bottom of this file) and **App Privacy**
   (answer **"Data Not Collected"** for everything).

---

## Path A — build on a capable Mac (simplest)

```bash
git clone https://github.com/maximstark/paint-by-numbers.git
cd paint-by-numbers
npm install                 # installs Capacitor
npm run ios:add             # builds www/ and creates the native ios/ project
npm run ios:assets          # generates the iOS app-icon + splash from resources/
npm run ios:open            # opens the project in Xcode
```

Then in **Xcode**:

1. Select the **App** target → **Signing & Capabilities** → check *Automatically manage
   signing* and pick your **Team** (your Apple Developer account).
2. Set **Version** (e.g. `1.0`) and **Build** (`1`).
3. Choose destination **Any iOS Device (arm64)** at the top.
4. **Product → Archive**. When it finishes, in the Organizer: **Distribute App →
   App Store Connect → Upload**.
5. Back in App Store Connect, attach the uploaded build to your app version, add screenshots
   (see below), and **Submit for Review**.

After any code change: `npm run ios:sync` then re-Archive.

---

## Path B — build without a capable Mac (free cloud Mac via GitHub Actions)

GitHub gives you free **macOS runners**. With an **App Store Connect API key** you can build,
sign, and upload entirely in the cloud — no local Xcode needed. This is more setup up front
(certificates + a signing tool like [Fastlane](https://docs.fastlane.tools/)), but then every
release is a button click.

A starter workflow is included at `.github/workflows/ios-build.yml.example`
(rename to `.yml` and fill in the secrets to activate it). High level:

1. Create an **App Store Connect API key** (App Store Connect → Users and Access → Integrations).
2. Create an iOS **distribution certificate** + **provisioning profile** (or let Fastlane
   `match`/`sigh` create them). Store them as GitHub **repository secrets**.
3. The workflow runs `npm ci`, `npm run ios:add`, builds with `xcodebuild`, and uploads with
   Fastlane's `pilot`/`deliver`.

If you want, I can wire this workflow up end-to-end once you have the API key — it's the
"press a button, it lands in TestFlight" path.

---

## Screenshots (required to submit)

Apple needs a few screenshots per device size. Easiest: run the app in the **iOS Simulator**
(comes with Xcode) or on a real iPad/iPhone and grab screenshots of:

1. the character gallery, 2. a picture mid-painting, 3. the confetti win screen.

Required sizes (upload at least one set): **6.7" iPhone** 1290×2796, and **12.9" iPad**
2048×2732 if you offer iPad. (I can also generate marketing-style screenshots from the game
art if you'd rather not use the Simulator — just ask.)

---

## Suggested App Store listing

- **Name:** Paint by Numbers
- **Subtitle (30 chars):** Paint cute animals by number
- **Promotional text:** Tap a color, fill the numbers, and reveal an adorable pixel friend.
  No ads, no sign-in, works offline.
- **Keywords (100 chars):** paint by numbers,kids,coloring,color,pixel,toddler,art,animals,cat,offline,no ads,drawing
- **Description:**
  > Paint by Numbers is a gentle, adorable coloring game for little artists. Pick a cute pixel
  > animal — kitty, puppy, bunny, bear, chick, fox, frog, or penguin — tap a color, and fill in
  > the matching numbers to bring it to life. Finish the picture for a happy confetti surprise! 🎉
  >
  > Made for tablets and little fingers:
  > • Big, friendly squares and large touch targets
  > • The right squares gently glow, so it's easy to find where to paint
  > • Wrong taps just wiggle — kids can't "ruin" a picture
  > • Progress is saved for each picture, so they can stop and come back
  > • Gentle sounds you can mute
  >
  > And the part parents will love: **no ads, no in-app purchases, no sign-in, no data
  > collection, and it works completely offline.** It's also fully open source.
- **Support URL:** https://github.com/maximstark/paint-by-numbers
- **Privacy Policy URL:** https://maximstark.github.io/paint-by-numbers/privacy.html
- **Category:** Games (Family / Educational). You may also list in the **Kids** category
  (ages 5 and under, or 6–8) — this app already meets its stricter rules (privacy policy, no
  ads, no data). It signals extra trust but adds review scrutiny; either is fine.
- **Age rating:** 4+.
- **Price:** free, or a one-time low price. The strongest "undercut" of the ad-stuffed
  competition is **free + no ads + no tracking + open source** — nothing to hide.

## App Privacy answers (App Store Connect)

Answer **"No, we do not collect data from this app."** for every category. That's accurate:
progress is stored only on-device and never transmitted.
