# Akira App 🍃

> **"இயற்கையால் இணைவோம், நஞ்சில்லா உலகை அமைப்போம்"** 
> *(Connect with nature, Build a toxin-free world)*

Akira is a bilingual (English & Tamil), responsive React Native mobile application built for organic grocery and fresh produce delivery. The app focuses on providing a seamless user experience with features like precise location fetching, delivery scheduling, AI-powered nutritional information, and a fully dynamic bilingual interface.

---

## 🚀 Key Features

* **Bilingual Support (i18n):** Full support for English and Tamil using `react-i18next`. The app dynamically adjusts text sizes and layouts based on the selected language to prevent UI clipping.
* **Fully Responsive UI:** Utilizes a custom `normalize` utility to ensure font sizes, paddings, and margins scale perfectly across all mobile screen sizes.
* **Smart Cart Management:** Integrated with **Redux Toolkit** to manage cart states (add, increment, decrement) globally, complete with a floating `GlobalCartBanner`.
* **Location & Mapping:** Uses `expo-location` and `react-native-maps` to fetch the user's current GPS coordinates, reverse-geocode the address, and display it on an interactive map.
* **Delivery Scheduling:** A dynamic `ScheduleDeliveryModal` allowing users to select upcoming dates (Today, Tomorrow, etc.) and specific time slots (Morning, Afternoon, Evening) for their deliveries.
* **AI Nutritional Info:** Specific product cards include an AI-driven banner that provides deeper insights into the health benefits of the selected produce.
* **OTP-based Authentication:** Clean, keyboard-aware login screen prompting for a 10-digit mobile number validation.

---

## 🛠 Tech Stack

* **Framework:** React Native (Expo)
* **Navigation:** React Navigation (`@react-navigation/native`)
* **State Management:** Redux Toolkit (`react-redux`, `@reduxjs/toolkit`)
* **Internationalization:** `react-i18next`, `i18next`
* **Maps & Location:** `react-native-maps`, `expo-location`
* **Icons:** `@expo/vector-icons` (Ionicons, MaterialCommunityIcons)
* **Storage:** `@react-native-async-storage/async-storage`

---

## 🚀 Expo App: Installation & Run Guide

Here are the step-by-step instructions to set up and run the React Native (Expo) app on your system.

### 1. Prerequisites
Before getting started, make sure you have **Node.js** installed on your system. If not, download and install it from the [Node.js website](https://nodejs.org/).

### 2. Installing Dependencies (`npm install`)

The `package.json` file in your project contains the list of all libraries and packages required for the app. Use the following commands to download them to your system and start the server:

**Step-by-step:**
1. Open your Terminal or Command Prompt.
2. Navigate to your project folder (e.g., `cd akira-app`).
3. Run the following commands:

```bash
npm install
npx expo start -c
```

---

### 3. How to Test the App?
You have three options to view and test the app once the server is running:

**A) On a Physical Mobile Device (Easy Method)**
1. Download the **Expo Go** app from the Google Play Store (Android) or App Store (iOS) on your phone.
2. Open the Expo Go app.
3. Scan the **QR Code** displayed in your system's terminal using your phone's camera or the Expo app scanner.
4. The app will load and open on your device within a few seconds!

**B) On an Android Emulator**
* If you have set up an Android Virtual Device (AVD) using Android Studio, press **`a`** on your keyboard in the terminal where the Expo server is running. The app will automatically install and open in the emulator.

**C) On an iOS Simulator (Mac Users Only)**
* If you are using a Mac with Xcode and a simulator set up, press **`i`** in the terminal. The iOS Simulator will open and run the app.

---

## 📁 Project Structure

```text
├── assets/
│   └── images/                 # Local image assets (e.g., Page-6.webp, fresh-picks.webp)
├── data/
│   └── data.js                 # Mock data/API integration for products
├── store/
│   ├── store.js                # Redux store configuration
│   ├── cartSlice.js            # Cart state logic
│   ├── languageSlice.js        # Language preference state
│   └── shopSlice.js            # Shop preference state
├── utils/
│   └── responsive.js           # custom normalize() function for responsive sizing
├── screens/
│   ├── LoginScreen.jsx         # Mobile number entry screen
│   ├── LocationScreen.jsx      # Map and address fetching
│   ├── CartScreen.jsx          # Cart details and checkout
│   ├── AllCategoriesScreen.jsx 
│   ├── AddressDetailsScreen.jsx 
│   ├── HomeScreen.jsx 
│   ├── LanguageScreen.jsx 
│   ├── ManageAddressesScreen.jsx 
│   ├── OnboardingScreen.jsx 
│   ├── OtpScreen.jsx 
│   ├── ProductDetailsScreen.jsx 
│   ├── ProfileScreen.jsx 
│   ├── Splash1Screen.jsx 
│   └── Splash2Screen.jsx 
├── components/
│   ├── ProductCard.jsx         # Reusable responsive product card
│   ├── HomeCategoriesSection.jsx 
│   ├── GlobalCartBanner.jsx    # Floating cart summary
│   ├── GlobalSearchBox.jsx     # Debounced search input
│   ├── ScheduleDeliveryModal.jsx
│   ├── FreshPicksSection.jsx
│   ├── FreshThisMorning.jsx
│   ├── PureNaturalContent.jsx
│   └── TopHeader.jsx
├── i18n.js                     # Translation configurations (en & ta)
└── App.jsx                     # Application entry point
```