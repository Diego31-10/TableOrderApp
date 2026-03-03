import { create } from 'zustand';
import { AppMode, Coordinates, DeliveryInfo } from '@/src/lib/core/types';

interface LocationState {
  appMode: AppMode;
  userLocation: Coordinates | null;
  restaurantLocation: Coordinates | null;
  deliveryInfo: DeliveryInfo | null;

  setLocations: (user: Coordinates, restaurant: Coordinates) => void;
  setAppMode: (mode: AppMode) => void;
  setDeliveryRoute: (info: DeliveryInfo) => void;
  resetLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  appMode: 'CHECKING',
  userLocation: null,
  restaurantLocation: null,
  deliveryInfo: null,

  setLocations: (user, restaurant) =>
    set({ userLocation: user, restaurantLocation: restaurant }),

  setAppMode: (mode) => set({ appMode: mode }),

  setDeliveryRoute: (info) => set({ deliveryInfo: info }),

  resetLocation: () =>
    set({
      appMode: 'CHECKING',
      restaurantLocation: null,
      deliveryInfo: null,
    }),
}));
