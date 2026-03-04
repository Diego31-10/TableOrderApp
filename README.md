<div align="center">

# TableOrder
### Smart Dining Solution

**Scan. Order. Pay. Done. — Or order delivery from anywhere.**

![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_SDK-55-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-Maps-000000?style=for-the-badge&logo=mapbox&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-FF6B35?style=for-the-badge)

> 📖 [Documentation](https://diego31-10-tableorderapp-25-2.mintlify.app/introduction) · 🌐 También disponible en [Español](./README-es.md)

</div>

---

## What is TableOrder?

TableOrder is a full-stack mobile ordering system for restaurants, built as a portfolio project to demonstrate real-world React Native patterns. It operates in two distinct modes determined automatically by GPS:

- **Table Mode** — Customer is inside the restaurant. They scan a QR code at their table, browse a context-aware menu, and pay directly from their phone.
- **Delivery Mode** — Customer is outside the restaurant. They tap the restaurant on a live map, browse the full menu, and checkout with a calculated shipping cost and real-time route tracking.

The app adapts its interface at every level: a bar table shows a drinks-only menu, a full dining table shows all categories, and a birthday table triggers a festive animation with an automatic discount.

---

## Features

| Feature | Description |
|---------|-------------|
| **GPS Geofencing** | Haversine-based context detection — inside restaurant radius activates QR scanner; outside activates delivery mode |
| **QR Scanner** | Idempotency-guarded camera scanner with branded overlay and haptic feedback |
| **Contextual Menus** | Menu content filtered by table type (`FULL` / `DRINKS_ONLY`) |
| **Birthday Mode** | Animated banner + automatic discount applied to cart total |
| **Delivery Catalog** | Full product catalog with per-km shipping cost calculated via Mapbox Directions API |
| **Route Tracking** | Post-payment Mapbox map showing the driving route, ETA, and distance from restaurant to user |
| **Virtual Card** | Real-time card preview with number/expiry masking |
| **Payment Flow** | Stripe-ready mock with 2 s latency simulation and failure states |
| **PDF Receipt** | Branded PDF ticket auto-generated with `expo-print` after every successful payment |
| **Telegram Dispatch** | PDF receipt sent silently to a Telegram chat via Bot API |
| **Push Notifications** | Immediate local notification after successful payment |
| **Multimodal Feedback** | Haptics + sound + notification on every key action |
| **Dark Mode** | Full dark-first design using the Expo Colors system |

---

## App Modes

```
App launch
    │
    ▼
ContextSwitcher (GPS + Mapbox map)
    │
    ├─── User taps restaurant pin, distance ≤ 50 m
    │         │
    │         ▼
    │    [SCANNER MODE]
    │    Scan QR code → contextual menu → cart → checkout
    │
    └─── User taps restaurant pin, distance > 50 m
              │
              ▼
         [DELIVERY MODE]
         Browse full catalog → cart → checkout → route tracking
```

---

## Architecture

TableOrder follows a **Feature-Based** directory structure inside `src/`:

```
src/
├── lib/
│   ├── core/               # App-wide singletons
│   │   ├── types.ts        # TypeScript interfaces (source of truth)
│   │   ├── mockData.ts     # Products + tables dataset
│   │   ├── config.ts       # API credentials from .env
│   │   ├── payments/       # paymentService — mock Stripe flow
│   │   ├── notifications/  # NotificationService — expo-notifications
│   │   └── sound/          # SoundService — expo-av beep
│   ├── modules/
│   │   └── menu/           # useMenuLogic — contextual filtering hook
│   └── services/           # External API integrations
│       ├── mapboxService.ts # Directions API + polyline decode + ETA
│       ├── pdfService.ts    # expo-print branded ticket generator
│       └── telegramService.ts # Bot API PDF upload
├── stores/
│   ├── useTableStore.ts    # Active table session (Zustand)
│   ├── useCartStore.ts     # Cart items, totals, discount, service type (Zustand)
│   └── useLocationStore.ts # App mode, GPS coords, delivery info (Zustand)
└── components/
    ├── scanner/            # CameraScanner with idempotency ref
    ├── location/           # ContextSwitcher — Mapbox map + geofencing logic
    └── ui/                 # ErrorState, BirthdayBanner, ToastMessage
```

**Why Feature-Based?**
Grouping by domain (`menu`, `payments`, `notifications`, `services`) rather than by file type means each feature is self-contained. Adding or removing a feature requires touching only one folder, keeping coupling low and cohesion high.

**Why Zustand over Redux?**
Zustand has zero boilerplate and no Provider needed. The three stores (`useTableStore`, `useCartStore`, `useLocationStore`) cover the entire session state in ~120 lines combined. State is accessed by selector, which means components only re-render when their specific slice changes.

---

## Use Cases

| Scenario | How TableOrder handles it |
|----------|--------------------------|
| Quick-service restaurant | Customer scans table QR → orders without calling staff → pays in seconds |
| Bar or lounge | Bar QR code shows drinks-only menu, blocking food items automatically |
| Birthday celebration | Special table QR activates animated banner and 15% discount on the total |
| Restaurant with delivery | Customer outside the geofence taps the restaurant on a map → sees full menu → gets real driving route and ETA after payment |
| Operator receipts | Every payment auto-generates a PDF and pushes it to a Telegram channel for back-office tracking |

---

## QR Test Codes

Use these strings to test the three in-restaurant flows (paste them into a QR generator and scan with the app):

| QR Code | Table | Menu Type | Special |
|---------|-------|-----------|---------|
| `TABLE_BAR_01` | Barra 01 | Drinks only | — |
| `TABLE_HALL_05` | Salon 05 | Full menu | — |
| `TABLE_BDAY_99` | Mesa Especial | Full menu | Birthday animation + 15% discount |

> **Quick QR generator:** [qr.io](https://qr.io) — paste the code string, download the QR, and scan with the app camera.

To test **Delivery Mode**, deny the restaurant geofence (tap a point farther than 50 m on the map) after granting location permission.

---

## Installation

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator, or a physical device with Expo Go

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/TableOrderApp.git
cd TableOrderApp

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your Mapbox token, Telegram bot token, and Stripe key

# 4. (Required for camera + Stripe + notifications + Mapbox native plugins)
npx expo prebuild

# 5. Run on device
npx expo run:android
# or
npx expo run:ios
```

---

## Environment Variables

Copy `.env.example` to `.env` and provide your credentials. The app runs without Telegram and with limited map functionality if tokens are omitted.

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_STRIPE_KEY` | Optional | Stripe publishable key (`pk_test_...`) |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | **Yes** | Mapbox public token for map rendering and Directions API |
| `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` | **Yes** (build) | Mapbox secret token — native SDK download at build time |
| `EXPO_PUBLIC_TELEGRAM_BOT_TOKEN` | Optional | Telegram bot token from `@BotFather` |
| `EXPO_PUBLIC_TELEGRAM_CHAT_ID` | Optional | Target chat ID for PDF receipt delivery |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.83 + Expo SDK 55 |
| Navigation | Expo Router (file-based) |
| State | Zustand 5 |
| Payments | Stripe React Native SDK |
| Maps | @rnmapbox/maps (Mapbox GL) |
| Location | expo-location (GPS + geofencing) |
| Camera | expo-camera |
| Animations | react-native-reanimated 4 |
| Notifications | expo-notifications |
| PDF | expo-print |
| Sound | expo-av |
| Haptics | expo-haptics |
| Icons | lucide-react-native |
| Language | TypeScript (strict mode) |

---

<div align="center">
Built with React Native + Expo

---

Licensed under the [MIT License](./LICENSE) — Copyright (c) 2026 Diego Torres
</div>
