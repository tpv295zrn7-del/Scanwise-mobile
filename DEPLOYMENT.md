# ScanWise Deployment Guide

End-to-end instructions for building, signing, and submitting ScanWise to the Apple App Store (via TestFlight) and Google Play Store.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [GitHub Secrets](#github-secrets)
4. [iOS — TestFlight & App Store](#ios--testflight--app-store)
5. [Android — Play Store](#android--play-store)
6. [CI/CD — Tag-Based Releases](#cicd--tag-based-releases)
7. [Rollback Procedures](#rollback-procedures)
8. [Release Checklist](#release-checklist)

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Apple Developer Account | https://developer.apple.com — paid ($99/yr) |
| Google Play Developer Account | https://play.google.com/console — one-time $25 |
| Xcode 15+ | macOS only |
| Android Studio / JDK 17 | For Android builds |
| Node.js 18+ | `nvm install 18` |
| CocoaPods | `sudo gem install cocoapods` |
| Fastlane | `sudo gem install fastlane` |

---

## Environment Setup

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. Fill in all values in `.env` (see variable descriptions in `.env.example`).

3. Install JS dependencies:
   ```bash
   npm ci
   ```

4. (iOS) Install pods:
   ```bash
   cd ios && pod install && cd ..
   ```

5. (Android) Generate the release keystore if you don't already have one:
   ```bash
   KEYSTORE_PASS=<yourpass> KEY_PASS=<yourpass> ./scripts/generate-keystore.sh
   ```

   > **Important:** Store `android/app/keystore/scanwise.keystore` in a secure location (password manager, encrypted drive). It is excluded from version control via `.gitignore`. **Losing it means you can never update your Play Store app.**

---

## GitHub Secrets

Add these secrets in **Settings → Secrets and variables → Actions** for the repository:

| Secret | Description |
|--------|-------------|
| `APPLE_TEAM_ID` | 10-character Apple Team ID |
| `APPLE_KEY_ID` | App Store Connect API Key ID |
| `KEYSTORE_BASE64` | Base64-encoded keystore file (`base64 -i android/app/keystore/scanwise.keystore`) |
| `KEYSTORE_PASS` | Keystore password |
| `KEY_ALIAS` | Key alias (default: `scanwise`) |
| `KEY_PASS` | Key password |
| `PLAY_STORE_JSON_KEY` | Full JSON content of the Play Store service account key |

---

## iOS — TestFlight & App Store

### Manual Build

```bash
./scripts/build-ios.sh
```

### TestFlight Upload (Fastlane)

1. Place your App Store Connect API key at:
   ```
   fastlane/AuthKey_<APPLE_KEY_ID>.p8
   ```

2. Run:
   ```bash
   APPLE_TEAM_ID=XXXXXXXXXX APPLE_KEY_ID=XXXXXXXXXX fastlane ios beta
   ```

3. Open [App Store Connect](https://appstoreconnect.apple.com) → TestFlight → verify build processing.

4. Add internal/external testers and send invitations.

### App Store Submission

1. Complete TestFlight testing.
2. Fill in app metadata (screenshots, description, keywords) in App Store Connect.
3. Submit for review:
   ```bash
   APPLE_TEAM_ID=XXXXXXXXXX APPLE_KEY_ID=XXXXXXXXXX fastlane ios release
   ```

---

## Android — Play Store

### Manual Build

```bash
./scripts/build-android.sh
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Play Store Upload (Fastlane)

1. Create a Play Store service account and download the JSON key.

2. Run:
   ```bash
   PLAY_STORE_JSON_KEY="$(cat /path/to/key.json)" \
   KEYSTORE_PASS=<pass> KEY_ALIAS=scanwise KEY_PASS=<pass> \
   fastlane android beta
   ```

3. Open [Google Play Console](https://play.google.com/console) → Internal testing → verify upload.

4. Promote to production when ready:
   ```bash
   PLAY_STORE_JSON_KEY="$(cat /path/to/key.json)" fastlane android release
   ```

---

## CI/CD — Tag-Based Releases

The GitHub Actions workflow in `.github/workflows/build-release.yml` runs automatically when a version tag is pushed.

### Trigger a Release

```bash
# Bump version in package.json and app.json first, then:
git tag v1.0.0
git push origin v1.0.0
```

This triggers:
1. `build-ios` job (macOS runner) — builds and uploads iOS artifact.
2. `build-android` job (Ubuntu runner) — builds and uploads APK artifact.
3. `create-release` job — creates a GitHub Release with both artifacts.

### Monitor Progress

Watch the run at:
```
https://github.com/tpv295zrn7-del/Scanwise-mobile/actions
```

---

## Rollback Procedures

### iOS

1. In App Store Connect → TestFlight, select the previous build.
2. If already in production, submit the previous version for expedited review, or use **Pause rollout** if in phased release.

### Android

```bash
# Promote the previous internal build back to production
PLAY_STORE_JSON_KEY="$(cat /path/to/key.json)" fastlane android release
```

Or in the Play Console: **Release → Production → Manage rollout → Halt rollout**.

---

## Release Checklist

### Pre-Release

- [ ] Version bumped in `package.json` (`version` field)
- [ ] Version/build number bumped in `app.json` (`version`, `ios.buildNumber`, `android.versionCode`)
- [ ] All tests passing: `npm test -- --runInBand`
- [ ] 0 lint errors: `npm run lint`
- [ ] 0 type errors: `npm run typecheck`
- [ ] Staging environment tested (all scan flows verified)
- [ ] App Store screenshots and metadata finalized
- [ ] Privacy policies up-to-date and linked in store listings
- [ ] Backend endpoints verified and healthy
- [ ] Security review passed (no secrets committed)
- [ ] CHANGELOG updated

### Release Steps

1. Bump version and commit:
   ```bash
   npm version patch   # or minor / major
   ```
2. Tag the release:
   ```bash
   git tag v1.0.0
   git push origin main --follow-tags
   ```
3. Monitor GitHub Actions build.
4. Download artifacts from the GitHub Release.
5. Submit iOS build to TestFlight; share with internal testers.
6. Submit Android APK to Play Store internal track.
7. Validate on real test devices (iOS + Android).
8. Promote iOS to App Store review; promote Android to production.

### Post-Release

- [ ] Monitor crash reports (Crashlytics / Sentry)
- [ ] Monitor store reviews
- [ ] Tag hotfix branch if critical issues found
