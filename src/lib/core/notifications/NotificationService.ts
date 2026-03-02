import * as Notifications from 'expo-notifications';

// Configure how notifications appear while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user.
 * Call this once during app startup or before the first notification.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Fire an immediate local notification confirming a successful payment.
 */
export async function sendPaymentNotification(
  amount: number,
  tableName: string
): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Pago exitoso',
      body: `Has pagado correctamente $${amount.toFixed(2)} en tu orden de la ${tableName}. Gracias por tu visita.`,
      sound: true,
    },
    trigger: null, // fire immediately
  });
}
