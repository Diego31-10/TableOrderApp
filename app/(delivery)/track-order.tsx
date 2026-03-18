import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapView, Camera, PointAnnotation, ShapeSource, LineLayer } from '@rnmapbox/maps';
import { useRouter } from 'expo-router';
import { Clock, MapPin, Navigation, PackageCheck } from 'lucide-react-native';

import { Brand } from '@/constants/Colors';
import { useLocationStore } from '@/src/stores/useLocationStore';
import { useCartStore } from '@/src/stores/useCartStore';
import { Config } from '@/src/lib/core/config';

// GeoJSON LineString shape built from the decoded Mapbox polyline
function buildRouteShape(
  coordinates: Array<{ latitude: number; longitude: number }>
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      // GeoJSON uses [longitude, latitude] — opposite of react-native convention
      coordinates: coordinates.map((c) => [c.longitude, c.latitude]),
    },
  };
}

export default function TrackOrderScreen() {
  const router = useRouter();
  const { userLocation, restaurantLocation, deliveryInfo, resetLocation } = useLocationStore();
  const { shippingCost, resetCart } = useCartStore();

  const handleDone = () => {
    resetCart();
    resetLocation();
    router.replace('/(tabs)');
  };

  // ── Fallback ────────────────────────────────────────────────────────────────
  if (!userLocation || !restaurantLocation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Brand.primary} />
          <Text style={styles.loadingText}>Cargando mapa de ruta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Camera bounds: fit both pins with padding ───────────────────────────────
  const cameraBounds = {
    ne: [
      Math.max(userLocation.longitude, restaurantLocation.longitude) + 0.008,
      Math.max(userLocation.latitude, restaurantLocation.latitude) + 0.008,
    ] as [number, number],
    sw: [
      Math.min(userLocation.longitude, restaurantLocation.longitude) - 0.008,
      Math.min(userLocation.latitude, restaurantLocation.latitude) - 0.008,
    ] as [number, number],
    paddingTop: 60,
    paddingBottom: 220, // leave room for the bottom panel
    paddingLeft: 40,
    paddingRight: 40,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <PackageCheck size={24} color={Brand.success} strokeWidth={1.8} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Pedido en camino</Text>
        </View>
      </View>

      {/* Mapbox map */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          logoEnabled={false}
          attributionEnabled={false}
          scaleBarEnabled={false}
        >
          {/* Fit camera to show both restaurant and user */}
          <Camera bounds={cameraBounds} animationMode="none" />

          {/* Route polyline — drawn from Mapbox Directions decoded geometry */}
          {deliveryInfo && deliveryInfo.decodedRoute.length > 1 && (
            <ShapeSource id="routeSource" shape={buildRouteShape(deliveryInfo.decodedRoute)}>
              <LineLayer
                id="routeLine"
                style={{
                  lineColor: Brand.primary,
                  lineWidth: 4,
                  lineCap: 'round',
                  lineJoin: 'round',
                  lineOpacity: 0.9,
                }}
              />
            </ShapeSource>
          )}

          {/* Pin A — Restaurant (origin) */}
          <PointAnnotation
            id="restaurant"
            coordinate={[restaurantLocation.longitude, restaurantLocation.latitude]}
          >
            <View style={styles.pinA}>
              <MapPin size={14} color="#fff" strokeWidth={2.5} />
            </View>
          </PointAnnotation>

          {/* Pin B — User / destination */}
          <PointAnnotation
            id="user"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.pinB}>
              <Navigation size={12} color="#fff" strokeWidth={2.5} />
            </View>
          </PointAnnotation>
        </MapView>
      </View>

      {/* ETA / info bottom panel */}
      <View style={styles.panel}>
        {deliveryInfo ? (
          <View style={styles.panelRow}>
            <View style={styles.panelItem}>
              <Clock size={20} color={Brand.primary} strokeWidth={1.8} />
              <View>
                <Text style={styles.panelLabel}>Tiempo estimado</Text>
                <Text style={styles.panelValue}>{deliveryInfo.etaMinutes} min</Text>
              </View>
            </View>

            <View style={styles.panelDivider} />

            <View style={styles.panelItem}>
              <Navigation size={20} color={Brand.primary} strokeWidth={1.8} />
              <View>
                <Text style={styles.panelLabel}>Distancia</Text>
                <Text style={styles.panelValue}>{deliveryInfo.distanceKm.toFixed(1)} km</Text>
              </View>
            </View>

            <View style={styles.panelDivider} />

            <View style={styles.panelItem}>
              <MapPin size={20} color={Brand.primary} strokeWidth={1.8} />
              <View>
                <Text style={styles.panelLabel}>Costo envío</Text>
                <Text style={styles.panelValue}>${shippingCost.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.panelItem}>
            <ActivityIndicator size="small" color={Brand.primary} />
            <Text style={styles.panelLabel}>Calculando ruta...</Text>
          </View>
        )}

        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.background },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: { fontSize: 14, color: Brand.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  headerText: { gap: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Brand.textPrimary },
  headerSub: { fontSize: 13, color: Brand.textSecondary },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  // Pin markers
  pinA: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  pinB: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.success,
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
  // Bottom panel
  panel: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Brand.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Brand.border,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  panelDivider: {
    width: 1,
    height: 36,
    backgroundColor: Brand.border,
    marginHorizontal: 4,
  },
  panelLabel: { fontSize: 11, color: Brand.textSecondary, fontWeight: '500' },
  panelValue: { fontSize: 16, fontWeight: '800', color: Brand.textPrimary, marginTop: 1 },
  doneBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
