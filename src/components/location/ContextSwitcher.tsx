import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
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
// Calculates the great-circle distance between two coordinates in meters.
// Formula: d = 2r·arcsin(√(sin²(Δφ/2) + cosφ₁·cosφ₂·sin²(Δλ/2)))

function calculateDistance(c1: Coordinates, c2: Coordinates): number {
  const R = 6_371_000; // Earth radius in meters
  const φ1 = (c1.latitude * Math.PI) / 180;
  const φ2 = (c2.latitude * Math.PI) / 180;
  const Δφ = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const Δλ = ((c2.longitude - c1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─── ContextSwitcher ──────────────────────────────────────────────────────────

type PermissionStatus = 'loading' | 'granted' | 'denied';

export default function ContextSwitcher() {
  const [permStatus, setPermStatus] = useState<PermissionStatus>('loading');
  const [locating, setLocating] = useState(true);
  const [restaurant, setRestaurant] = useState<Coordinates | null>(null);

  const { userLocation, setLocations, setAppMode } = useLocationStore();
  const { setServiceType } = useCartStore();
  const router = useRouter();

  // ── 1. Request permissions & capture user position ──────────────────────────
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
        // restaurantLocation stays null until user taps the map
        { latitude: 0, longitude: 0 }
      );
      setLocating(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Handle map tap — set restaurant and decide mode ──────────────────────
  const onMapPress = useCallback(
    (e: MapPressEvent) => {
      if (!userLocation) return;

      const tapped: Coordinates = e.nativeEvent.coordinate;
      setRestaurant(tapped);

      const distanceMeters = calculateDistance(userLocation, tapped);
      const { geofenceRadiusMeters } = Config.restaurant;

      if (distanceMeters <= geofenceRadiusMeters) {
        // ── IN-SITU: user is inside the restaurant ────────────────────────
        setLocations(userLocation, tapped);
        setAppMode('SCANNER');
        setServiceType('TABLE');
        // Navigation handled in parent (index.tsx re-renders from store)
      } else {
        // ── DELIVERY: user is outside the restaurant ──────────────────────
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

  // ── Loading GPS ─────────────────────────────────────────────────────────────
  if (permStatus === 'loading' || locating || !userLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Brand.primary} />
        <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  // ── Map active ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        onPress={onMapPress}
        showsUserLocation
        showsMyLocationButton={Platform.OS === 'android'}
      >
        {/* User pin — provided by showsUserLocation above (blue dot) */}

        {/* Restaurant pin — appears when user taps */}
        {restaurant && (
          <Marker
            coordinate={restaurant}
            title="Restaurante"
            description="Punto de referencia seleccionado"
            pinColor={Brand.primary}
          />
        )}
      </MapView>

      {/* Instruction overlay */}
      <View style={styles.instructionCard}>
        <MapPinned size={20} color={Brand.primary} strokeWidth={1.8} />
        <View style={styles.instructionText}>
          <Text style={styles.instructionTitle}>Selecciona el restaurante</Text>
          <Text style={styles.instructionBody}>
            Toca en el mapa donde está el restaurante. La app detectará si estás
            dentro ({Config.restaurant.geofenceRadiusMeters} m) para activar el
            modo correcto.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: Brand.background,
  },
  loadingText: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
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
  instructionText: {
    flex: 1,
    gap: 4,
  },
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
