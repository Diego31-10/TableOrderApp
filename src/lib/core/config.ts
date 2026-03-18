/**
 * Central API configuration.
 * All credentials are read from .env (never hardcoded).
 * See SETUP2.md for setup instructions.
 */
export const Config = {
  mapbox: {
    token: process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '',
  },
  telegram: {
    botToken: process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN ?? '',
    chatId: process.env.EXPO_PUBLIC_TELEGRAM_CHAT_ID ?? '',
  },
  restaurant: {
    /** Shipping cost multiplier: $1 USD per km */
    costPerKm: 1.0,
    /** Geofence radius in meters — inside = Modo Mesa, outside = Modo Delivery */
    geofenceRadiusMeters: 50,
    /** Default map center — Cuenca, Ecuador */
    defaultCenter: { latitude: -2.9001, longitude: -79.0059 },
  },
} as const;
