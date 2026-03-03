import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Clock, MapPin, Navigation, PackageCheck } from 'lucide-react-native';

import { Brand } from '@/constants/Colors';
import { useLocationStore } from '@/src/stores/useLocationStore';
import { useCartStore } from '@/src/stores/useCartStore';
import { Config } from '@/src/lib/core/config';

export default function TrackOrderScreen() {
  const router = useRouter();
  const { userLocation, restaurantLocation, deliveryInfo, resetLocation } = useLocationStore();
  const { shippingCost, resetCart } = useCartStore();

  const handleDone = () => {
    resetCart();
    resetLocation();
    router.replace('/(tabs)');
  };

  // ── Fallback: no location data ─────────────────────────────────────────────
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

  // ── Calculate map region to fit both pins ──────────────────────────────────
  const midLat = (userLocation.latitude + restaurantLocation.latitude) / 2;
  const midLon = (userLocation.longitude + restaurantLocation.longitude) / 2;
  const deltaLat = Math.abs(userLocation.latitude - restaurantLocation.latitude) * 1.5 + 0.01;
  const deltaLon = Math.abs(userLocation.longitude - restaurantLocation.longitude) * 1.5 + 0.01;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <PackageCheck size={24} color={Brand.success} strokeWidth={1.8} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Pedido en camino</Text>
          <Text style={styles.headerSub}>Tu orden ha sido confirmada</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          region={{
            latitude: midLat,
            longitude: midLon,
            latitudeDelta: deltaLat,
            longitudeDelta: deltaLon,
          }}
        >
          {/* Pin A — Restaurant */}
          <Marker
            coordinate={restaurantLocation}
            title={Config.restaurant.name}
            description="Origen del pedido"
            pinColor={Brand.primary}
          />

          {/* Pin B — Customer */}
          <Marker
            coordinate={userLocation}
            title="Tu ubicación"
            description="Destino de entrega"
            pinColor={Brand.success}
          />

          {/* Route polyline — drawn if Mapbox route was fetched */}
          {deliveryInfo && deliveryInfo.decodedRoute.length > 0 && (
            <Polyline
              coordinates={deliveryInfo.decodedRoute}
              strokeColor={Brand.primary}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}
        </MapView>
      </View>

      {/* ETA / Info bottom panel */}
      <View style={styles.panel}>
        {deliveryInfo ? (
          <>
            {/* ETA row */}
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
          </>
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
  headerText: { gap: 2 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Brand.textPrimary,
  },
  headerSub: { fontSize: 13, color: Brand.textSecondary },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
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
  panelLabel: {
    fontSize: 11,
    color: Brand.textSecondary,
    fontWeight: '500',
  },
  panelValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Brand.textPrimary,
    marginTop: 1,
  },
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
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
