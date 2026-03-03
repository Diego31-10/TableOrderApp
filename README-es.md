<div align="center">

# TableOrder
### Solución Inteligente para Restaurantes

**Escanea. Ordena. Paga. Listo. — O pide delivery desde cualquier lugar.**

![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_SDK-55-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Pagos-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-Mapas-000000?style=for-the-badge&logo=mapbox&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-FF6B35?style=for-the-badge)

> 🌐 Also available in [English](./README.md)

</div>

---

## ¿Qué es TableOrder?

TableOrder es un sistema completo de pedidos móviles para restaurantes, construido como proyecto de portafolio para demostrar patrones de React Native del mundo real. Opera en dos modos distintos determinados automáticamente por GPS:

- **Modo Mesa** — El cliente está dentro del restaurante. Escanea un código QR en su mesa, navega por un menú contextual y paga directamente desde su teléfono.
- **Modo Delivery** — El cliente está fuera del restaurante. Toca el restaurante en un mapa en vivo, navega por el menú completo y realiza el pago con el costo de envío calculado y seguimiento de ruta en tiempo real.

La app adapta su interfaz en cada nivel: una mesa de barra muestra solo el menú de bebidas, una mesa de salón muestra todas las categorías, y una mesa de cumpleaños activa una animación festiva con descuento automático.

---

## Funcionalidades

| Función | Descripción |
|---------|-------------|
| **Geofencing GPS** | Detección de contexto basada en Haversine — dentro del radio del restaurante activa el escáner QR; fuera activa el modo delivery |
| **Escáner QR** | Escáner de cámara con guardia de idempotencia, overlay de marca y retroalimentación háptica |
| **Menús Contextuales** | Contenido del menú filtrado por tipo de mesa (`FULL` / `DRINKS_ONLY`) |
| **Modo Cumpleaños** | Banner animado + descuento automático aplicado al total del carrito |
| **Catálogo Delivery** | Catálogo completo de productos con costo de envío por km calculado vía Mapbox Directions API |
| **Seguimiento de Ruta** | Mapa Mapbox post-pago mostrando la ruta de conducción, ETA y distancia del restaurante al usuario |
| **Tarjeta Virtual** | Vista previa en tiempo real de la tarjeta con enmascaramiento de número/vencimiento |
| **Flujo de Pago** | Mock listo para Stripe con simulación de 2 s de latencia y estados de fallo |
| **Recibo PDF** | Ticket PDF con diseño de marca generado automáticamente con `expo-print` tras cada pago exitoso |
| **Despacho por Telegram** | Recibo PDF enviado silenciosamente a un chat de Telegram vía Bot API |
| **Notificaciones Push** | Notificación local inmediata tras el pago exitoso |
| **Retroalimentación Multimodal** | Hápticos + sonido + notificación en cada acción clave |
| **Modo Oscuro** | Diseño completo dark-first usando el sistema de colores de Expo |

---

## Modos de la App

```
Inicio de la app
    │
    ▼
ContextSwitcher (GPS + mapa Mapbox)
    │
    ├─── El usuario toca el pin del restaurante, distancia ≤ 50 m
    │         │
    │         ▼
    │    [MODO ESCÁNER]
    │    Escanear QR → menú contextual → carrito → checkout
    │
    └─── El usuario toca el pin del restaurante, distancia > 50 m
              │
              ▼
         [MODO DELIVERY]
         Navegar catálogo completo → carrito → checkout → seguimiento de ruta
```

---

## Arquitectura

TableOrder sigue una estructura de directorios **basada en funcionalidades** dentro de `src/`:

```
src/
├── lib/
│   ├── core/               # Singletons de toda la app
│   │   ├── types.ts        # Interfaces TypeScript (fuente de verdad)
│   │   ├── mockData.ts     # Dataset de productos y mesas
│   │   ├── config.ts       # Credenciales de API desde .env
│   │   ├── payments/       # paymentService — flujo mock de Stripe
│   │   ├── notifications/  # NotificationService — expo-notifications
│   │   └── sound/          # SoundService — beep con expo-av
│   ├── modules/
│   │   └── menu/           # useMenuLogic — hook de filtrado contextual
│   └── services/           # Integraciones con APIs externas
│       ├── mapboxService.ts # Directions API + decodificación de polilínea + ETA
│       ├── pdfService.ts    # Generador de ticket con expo-print
│       └── telegramService.ts # Subida de PDF vía Bot API
├── stores/
│   ├── useTableStore.ts    # Sesión de mesa activa (Zustand)
│   ├── useCartStore.ts     # Items del carrito, totales, descuento, tipo de servicio (Zustand)
│   └── useLocationStore.ts # Modo de app, coordenadas GPS, info de delivery (Zustand)
└── components/
    ├── scanner/            # CameraScanner con ref de idempotencia
    ├── location/           # ContextSwitcher — mapa Mapbox + lógica de geofencing
    └── ui/                 # ErrorState, BirthdayBanner, ToastMessage
```

**¿Por qué basado en funcionalidades?**
Agrupar por dominio (`menu`, `payments`, `notifications`, `services`) en lugar de por tipo de archivo significa que cada funcionalidad es autocontenida. Agregar o eliminar una funcionalidad requiere tocar solo una carpeta, manteniendo bajo acoplamiento y alta cohesión.

**¿Por qué Zustand en lugar de Redux?**
Zustand no tiene boilerplate y no necesita Provider. Los tres stores (`useTableStore`, `useCartStore`, `useLocationStore`) cubren todo el estado de sesión en ~120 líneas combinadas. El estado se accede por selector, lo que significa que los componentes solo se re-renderizan cuando cambia su slice específico.

---

## Casos de Uso

| Escenario | Cómo lo maneja TableOrder |
|-----------|--------------------------|
| Restaurante de servicio rápido | El cliente escanea el QR de la mesa → pide sin llamar al personal → paga en segundos |
| Bar o lounge | El QR de la barra muestra solo el menú de bebidas, bloqueando automáticamente los alimentos |
| Celebración de cumpleaños | El QR de mesa especial activa un banner animado y 15% de descuento en el total |
| Restaurante con delivery | El cliente fuera del geofence toca el restaurante en el mapa → ve el menú completo → recibe ruta de conducción real y ETA tras el pago |
| Recibos del operador | Cada pago genera automáticamente un PDF y lo envía a un canal de Telegram para seguimiento de back-office |

---

## Códigos QR de Prueba

Usa estas cadenas para probar los tres flujos dentro del restaurante (pégalos en un generador de QR y escanéalos con la app):

| Código QR | Mesa | Tipo de Menú | Especial |
|-----------|------|--------------|---------|
| `TABLE_BAR_01` | Barra 01 | Solo bebidas | — |
| `TABLE_HALL_05` | Salon 05 | Menú completo | — |
| `TABLE_BDAY_99` | Mesa Especial | Menú completo | Animación de cumpleaños + 15% descuento |

> **Generador de QR rápido:** [qr.io](https://qr.io) — pega el código, descarga el QR y escanéalo con la cámara de la app.

Para probar el **Modo Delivery**, deniega el geofence del restaurante (toca un punto a más de 50 m en el mapa) después de conceder el permiso de ubicación.

---

## Instalación

### Requisitos previos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Simulador de iOS / Emulador de Android, o un dispositivo físico con Expo Go

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/YOUR_USERNAME/TableOrderApp.git
cd TableOrderApp

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y completa tu token de Mapbox, token del bot de Telegram y clave de Stripe

# 4. (Requerido para los plugins nativos de cámara + Stripe + notificaciones + Mapbox)
npx expo prebuild

# 5. Ejecutar en el dispositivo
npx expo run:android
# o
npx expo run:ios
```

---

## Variables de Entorno

Copia `.env.example` a `.env` y proporciona tus credenciales. La app funciona sin Telegram y con funcionalidad de mapa limitada si se omiten los tokens.

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `EXPO_PUBLIC_STRIPE_KEY` | Opcional | Clave publicable de Stripe (`pk_test_...`) |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | **Sí** | Token público de Mapbox para renderizado de mapas y Directions API |
| `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` | **Sí** (build) | Token secreto de Mapbox — descarga del SDK nativo en tiempo de compilación |
| `EXPO_PUBLIC_TELEGRAM_BOT_TOKEN` | Opcional | Token del bot de Telegram de `@BotFather` |
| `EXPO_PUBLIC_TELEGRAM_CHAT_ID` | Opcional | ID del chat destino para entrega del recibo PDF |

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React Native 0.83 + Expo SDK 55 |
| Navegación | Expo Router (basado en archivos) |
| Estado | Zustand 5 |
| Pagos | Stripe React Native SDK |
| Mapas | @rnmapbox/maps (Mapbox GL) |
| Ubicación | expo-location (GPS + geofencing) |
| Cámara | expo-camera |
| Animaciones | react-native-reanimated 4 |
| Notificaciones | expo-notifications |
| PDF | expo-print |
| Sonido | expo-av |
| Hápticos | expo-haptics |
| Iconos | lucide-react-native |
| Lenguaje | TypeScript (modo estricto) |

---

<div align="center">
Construido con React Native + Expo

---

Licenciado bajo la [Licencia MIT](./LICENSE) — Copyright (c) 2026 Diego Torres
</div>
