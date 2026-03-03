import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { MapView, Camera, PointAnnotation } from '@rnmapbox/maps';
import type { Camera as CameraType } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { MapPin, Navigation, MapPinned } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Brand } from '@/constants/Colors';
import { Coordinates } from '@/src/lib/core/types';
import { Config } from '@/src/lib/core/config';
import { useLocationStore } from '@/src/stores/useLocationStore';
import { useCartStore } from '@/src/stores/useCartStore';
import ErrorState from '@/src/components/ui/ErrorState';

// ─── Haversine Formula ────────────────────────────────────────────────────────
// d = 2r·arcsin(√(sin²(Δφ/2) + cosφ₁·cosφ₂·sin²(Δλ/2)))

function calculateDistance(c1: Coordinates, c2: Coordinates): number {
  const R = 6_371_000;
  const φ1 = (c1.latitude * Math.PI) / 180;
  const φ2 = (c2.latitude * Math.PI) / 180;
  const Δφ = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const Δλ = ((c2.longitude - c1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── ContextSwitcher ──────────────────────────────────────────────────────────

type PermissionStatus = 'loading' | 'granted' | 'denied';

// GeoJSON feature shape returned by MapView.onPress
type MapPressFeature = {
  geometry: { type: string; coordinates: number[] };
};

const { defaultCenter } = Config.restaurant;

export default function ContextSwitcher() {
  const [permStatus, setPermStatus] = useState<PermissionStatus>('loading');
  const [locating, setLocating] = useState(true);
  const [restaurant, setRestaurant] = useState<Coordinates | null>(null);

  const cameraRef = useRef<CameraType>(null);

  const { userLocation, setLocations, setAppMode } = useLocationStore();
  const { setServiceType } = useCartStore();
  const router = useRouter();

  // ── 1. Request permissions & capture user GPS position ─────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermStatus('denied');
        setLocating(false);
        return;
      }
      setPermStatus('granted');
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocations(
        { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        { latitude: 0, longitude: 0 }
      );
      setLocating(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Fly to user location once GPS is ready ───────────────────────────────
  useEffect(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 15,
        animationDuration: 800,
      });
    }
  }, [userLocation]);

  // ── 3. Map tap → set restaurant → Haversine → decide mode ──────────────────
  // Note: Mapbox uses GeoJSON coordinate order [longitude, latitude]
  const onMapPress = useCallback(
    (feature: MapPressFeature) => {
      if (!userLocation) return;

      const [longitude, latitude] = feature.geometry.coordinates;
      const tapped: Coordinates = { latitude, longitude };

      setRestaurant(tapped);

      const distanceMeters = calculateDistance(userLocation, tapped);

      if (distanceMeters <= Config.restaurant.geofenceRadiusMeters) {
        // ── IN-SITU: dentro del restaurante ──────────────────────────────────
        setLocations(userLocation, tapped);
        setAppMode('SCANNER');
        setServiceType('TABLE');
        // index.tsx re-renders from store change — no explicit navigation needed
      } else {
        // ── DELIVERY: fuera del restaurante ──────────────────────────────────
        setLocations(userLocation, tapped);
        setAppMode('DELIVERY');
        setServiceType('DELIVERY');
        router.push('/(delivery)/delivery-catalog');
      }
    },
    [userLocation, setLocations, setAppMode, setServiceType, router]
  );

  // ── Permission denied ───────────────────────────────────────────────────────
  if (permStatus === 'denied') {
    return (
      <ErrorState
        icon={<Navigation size={60} color={Brand.primary} strokeWidth={1.4} />}
        title="Ubicación bloqueada"
        message="TableOrder necesita acceso a tu ubicación para detectar si estás en el restaurante o necesitas delivery."
        primaryAction={{
          label: 'Abrir configuración',
          onPress: () => Linking.openSettings(),
          icon: <MapPin size={16} color="#fff" strokeWidth={2} />,
        }}
      />
    );
  }

  // ── Map (shown immediately centered on Cuenca; flies to GPS when ready) ─────
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        onPress={onMapPress}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
      >
        {/* Start at Cuenca; useEffect flies to real GPS once available */}
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [defaultCenter.longitude, defaultCenter.latitude],
            zoomLevel: 13,
          }}
        />

        {/* User pin — shown once GPS resolves */}
        {userLocation && (
          <PointAnnotation
            id="user-pin"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.userPin}>
              <Navigation size={12} color="#fff" strokeWidth={2.5} />
            </View>
          </PointAnnotation>
        )}

        {/* Restaurant pin — appears after user taps the map */}
        {restaurant && (
          <PointAnnotation
            id="restaurant-pin"
            coordinate={[restaurant.longitude, restaurant.latitude]}
          >
            <View style={styles.restaurantPin}>
              <View style={styles.restaurantPinDot} />
            </View>
          </PointAnnotation>
        )}
      </MapView>

      {/* GPS acquiring overlay */}
      {locating && (
        <View style={styles.locatingBadge}>
          <ActivityIndicator size="small" color={Brand.primary} />
          <Text style={styles.locatingText}>Obteniendo ubicación...</Text>
        </View>
      )}

      {/* Instruction card */}
      <View style={styles.instructionCard}>
        <MapPinned size={20} color={Brand.primary} strokeWidth={1.8} />
        <View style={styles.instructionText}>
          <Text style={styles.instructionTitle}>Selecciona el restaurante</Text>
          <Text style={styles.instructionBody}>
            Toca en el mapa donde está el restaurante. Si estás a menos de{' '}
            {Config.restaurant.geofenceRadiusMeters} m se activa el escáner QR;
            si estás más lejos, se activa el modo delivery.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // User location pin (replaces <UserLocation> to avoid EventEmitter crash)
  userPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // Restaurant pin marker
  restaurantPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  restaurantPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  // GPS acquiring badge (overlay, doesn't block the map)
  locatingBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Brand.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  locatingText: { fontSize: 13, color: Brand.textSecondary, fontWeight: '500' },
  // Instruction overlay card
  instructionCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: Brand.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  instructionText: { flex: 1, gap: 4 },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.textPrimary,
  },
  instructionBody: {
    fontSize: 13,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
});
