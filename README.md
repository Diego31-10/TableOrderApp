<div align="center">

# TableOrder
### Smart Dining Solution

**Scan. Order. Pay. Done.**

![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_SDK-55-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-FF6B35?style=for-the-badge)

</div>

---

## What is TableOrder?

TableOrder eliminates friction from the restaurant experience. Customers scan a QR code at their table, browse a context-aware menu, build their order, and pay — all from their phone, without waiting for staff.

The app adapts its interface based on which QR is scanned: a bar table shows a drinks-only menu, a full dining table shows all categories, and a birthday table triggers a festive animation with an automatic discount.

---

## Features

| Feature | Description |
|---------|-------------|
| **QR Scanner** | Idempotency-guarded camera scanner with branded overlay and haptic feedback |
| **Contextual Menus** | Menu content filtered by table type (`FULL` / `DRINKS_ONLY`) |
| **Birthday Mode** | Animated banner + automatic discount applied to cart total |
| **Virtual Card** | Real-time card preview with number/expiry masking |
| **Payment Flow** | Stripe-ready mock with 2 s latency simulation and failure states |
| **Push Notifications** | Immediate local notification after successful payment |
| **Multimodal Feedback** | Haptics + sound + notification on every key action |
| **Dark Mode** | Full dark-first design using the Expo Colors system |

---

## Architecture

TableOrder follows a **Feature-Based** directory structure inside `src/`:

```
src/
├── lib/
│   ├── core/               # App-wide singletons
│   │   ├── types.ts        # TypeScript interfaces (source of truth)
│   │   ├── mockData.ts     # Products + tables dataset
│   │   ├── payments/       # paymentService — mock Stripe flow
│   │   ├── notifications/  # NotificationService — expo-notifications
│   │   └── sound/          # SoundService — expo-av beep
│   └── modules/
│       └── menu/           # useMenuLogic — contextual filtering hook
├── stores/
│   ├── useTableStore.ts    # Active table session (Zustand)
│   └── useCartStore.ts     # Cart items, totals, discount (Zustand)
└── components/
    ├── scanner/            # CameraScanner with idempotency ref
    └── ui/                 # ErrorState, BirthdayBanner, ToastMessage
```

**Why Feature-Based?**
Grouping by domain (`menu`, `payments`, `notifications`) rather than by file type (`components`, `hooks`, `utils`) means each feature is self-contained. Adding or removing a feature requires touching only one folder, keeping coupling low and cohesion high.

**Why Zustand over Redux?**
Zustand has zero boilerplate and no Provider needed. The two stores (`useTableStore`, `useCartStore`) cover the entire session state in ~80 lines combined. State is accessed by selector, which means components only re-render when their specific slice changes.

---

## QR Test Codes

Use these strings to test the three main flows (type them into a QR generator or use the simulator):

| QR Code | Table | Menu Type | Special |
|---------|-------|-----------|---------|
| `TABLE_BAR_01` | Barra 01 | Drinks only | — |
| `TABLE_HALL_05` | Salon 05 | Full menu | — |
| `TABLE_BDAY_99` | Mesa Especial | Full menu | Birthday animation + 15% discount |

> **Quick QR generator:** [qr.io](https://qr.io) — paste the code string, download the QR, and scan with the app camera.

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

# 3. (Required for camera + Stripe + notifications native plugins)
npx expo prebuild

# 4. Run on device
npx expo run:android
# or
npx expo run:ios
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.83 + Expo SDK 55 |
| Navigation | Expo Router (file-based) |
| State | Zustand 5 |
| Payments | Stripe React Native SDK |
| Camera | expo-camera |
| Animations | react-native-reanimated 4 |
| Notifications | expo-notifications |
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
