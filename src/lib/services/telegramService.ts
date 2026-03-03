/**
 * Telegram Bot Service
 * Sends a PDF ticket directly to a Telegram chat via the Bot API.
 * Uses React Native's FormData + fetch for multipart/form-data file upload.
 *
 * Bot API Reference:
 *   POST https://api.telegram.org/bot{TOKEN}/sendDocument
 */

import { Config } from '@/src/lib/core/config';

const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Sends a PDF file to the configured Telegram chat.
 * Silently fails (console.error only) to never interrupt the user experience.
 *
 * @param pdfUri - Local file URI returned by expo-print (file://...)
 */
export async function sendTicketToTelegram(pdfUri: string): Promise<void> {
  const { botToken, chatId } = Config.telegram;

  if (!botToken || !chatId) {
    console.warn('[Telegram] Bot credentials not configured. See SETUP2.md.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);

    // React Native requires this specific object shape for file uploads
    formData.append('document', {
      uri: pdfUri,
      name: `ticket_orden_${Date.now()}.pdf`,
      type: 'application/pdf',
    } as unknown as Blob);

    formData.append(
      'caption',
      `Ticket de pago — ${Config.restaurant.name}\n${new Date().toLocaleString('es-ES')}`
    );

    const response = await fetch(
      `${TELEGRAM_API}/bot${botToken}/sendDocument`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error(`[Telegram] sendDocument failed: ${response.status}`, body);
    }
  } catch (err) {
    // Silent failure — never block the payment success flow
    console.error('[Telegram] sendTicketToTelegram error:', err);
  }
}
