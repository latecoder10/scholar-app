# Exam Scholar Mobile - Standalone App Package

A production-ready, offline-first React Native & Expo mobile app for **Claude CCAF** and **CIL MT CS** preparation.

---

## 🚀 Option 1: Instant Install & Run with Expo Go (Easiest - 1 Minute)

1. Install **Expo Go** on your phone from Google Play Store or Apple App Store.
2. In your terminal, run:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. Open Expo Go:
   - **Android**: Scan the terminal QR code using Expo Go.
   - **iOS**: Scan the QR code with your iPhone Camera app and tap the Expo banner.
4. The app will launch instantly on your device with all 1,128+ offline questions and lazy-chunked performance!

---

## 📦 Option 2: Build Standalone Installable Android APK (`.apk`)

To generate a standalone `.apk` file that you can directly install on any Android phone (without needing Expo Go or Play Store):

```bash
cd mobile

# 1. Install EAS CLI globally if you haven't already
npm install -g eas-cli

# 2. Log in or create free Expo account
npx eas login

# 3. Build standalone APK
npx eas build -p android --profile preview
```
Once the build completes (takes ~3 minutes on Expo Cloud), EAS will give you a direct download link to your `.apk` file. Open the link on your phone to install directly!

---

## 🛠️ Option 3: Local Android Studio Build (No Cloud)

```bash
cd mobile
npx expo run:android
```
This generates the native `/android` folder and compiles the APK locally via Gradle.

---

## ⚡ Key Features
- **Anti-Lag Lazy Loading**: Split into `ccafQuestions.json` (425 Qs) and `cilQuestions.json` (703 Qs).
- **100% Offline Persistence**: Uses AsyncStorage with instant recovery.
- **30-Second Exam Tricks**: Step-by-step mathematical tricks and architectural diagrams.
- **Timed Mock Arena**: Real countdown timer with official marking schemes.
