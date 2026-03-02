export type PaymentResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Simulates a payment intent round-trip with realistic latency.
 * Fails 15% of the time to allow testing the error flow.
 */
export async function processMockPayment(_amount: number): Promise<PaymentResult> {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));

  const willSucceed = Math.random() > 0.15;

  if (willSucceed) {
    return { success: true };
  }

  return {
    success: false,
    error:
      'Lo sentimos, el banco rechazo la transaccion. Intenta con otro metodo.',
  };
}
