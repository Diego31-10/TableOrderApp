/**
 * PDF Ticket Generator
 * Uses expo-print to render an HTML template and save it as a PDF
 * in the device's temporary file system.
 *
 * The generated PDF is then passed to telegramService for dispatch.
 */

import * as Print from 'expo-print';
import { CartItem } from '@/src/lib/core/types';
import { Config } from '@/src/lib/core/config';

// ─── Input ────────────────────────────────────────────────────────────────────

export interface TicketData {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  shippingCost: number;
  serviceType: 'TABLE' | 'DELIVERY';
  /** Mesa displayName for TABLE orders */
  tableName?: string;
  /** ISO string of the current date */
  timestamp?: string;
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildTicketHTML(data: TicketData): string {
  const orderId = `TO-${Date.now().toString(36).toUpperCase()}`;
  const dateStr = data.timestamp
    ? new Date(data.timestamp).toLocaleString('es-ES')
    : new Date().toLocaleString('es-ES');

  const serviceLabel =
    data.serviceType === 'TABLE'
      ? `Mesa: ${data.tableName ?? 'Sin nombre'}`
      : `Delivery`;

  const discountAmount = data.subtotal - (data.total - data.shippingCost);
  const showDiscount = data.discount > 0 && discountAmount > 0;

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td class="item-name">${item.quantity}x ${item.product.name}</td>
        <td class="item-price">$${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ticket TableOrder</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      background: #f9f9f9;
      padding: 32px 24px;
      color: #1a1a1a;
    }
    .ticket {
      max-width: 420px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    }
    /* ── Header ── */
    .header {
      background: #E25822;
      padding: 24px 20px 20px;
      color: #fff;
      text-align: center;
    }
    .logo {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .logo-sub {
      font-size: 11px;
      opacity: 0.8;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    /* ── Meta ── */
    .meta {
      display: flex;
      justify-content: space-between;
      padding: 16px 20px;
      background: #fafafa;
      border-bottom: 1px solid #ececec;
    }
    .meta-block { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .meta-value { font-size: 13px; font-weight: 700; color: #1a1a1a; }
    .service-badge {
      display: inline-block;
      background: #E25822;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.5px;
    }
    /* ── Items ── */
    .items-section { padding: 20px; }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 12px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table td { padding: 7px 0; vertical-align: top; }
    .item-name { font-size: 14px; color: #333; width: 75%; }
    .item-price { font-size: 14px; font-weight: 600; color: #1a1a1a; text-align: right; }
    .divider { height: 1px; background: #ececec; margin: 0 20px; }
    /* ── Totals ── */
    .totals { padding: 16px 20px; }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #666;
      margin-bottom: 6px;
    }
    .total-row.discount { color: #e67e22; }
    .total-row.grand {
      font-size: 17px;
      font-weight: 800;
      color: #1a1a1a;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #E25822;
    }
    .grand-amount { color: #E25822; }
    /* ── Footer ── */
    .footer {
      background: #f5f5f5;
      padding: 14px 20px;
      text-align: center;
      font-size: 11px;
      color: #aaa;
      border-top: 1px solid #ececec;
    }
  </style>
</head>
<body>
  <div class="ticket">
    <!-- Header -->
    <div class="header">
      <div class="logo">TableOrder</div>
      <div class="logo-sub">Comprobante de pago</div>
    </div>

    <!-- Meta info -->
    <div class="meta">
      <div class="meta-block">
        <span class="meta-label">Orden</span>
        <span class="meta-value">${orderId}</span>
      </div>
      <div class="meta-block" style="text-align:center">
        <span class="meta-label">Servicio</span>
        <span class="service-badge">${serviceLabel}</span>
      </div>
      <div class="meta-block" style="text-align:right">
        <span class="meta-label">Fecha</span>
        <span class="meta-value">${dateStr}</span>
      </div>
    </div>

    <!-- Items -->
    <div class="items-section">
      <div class="section-title">Detalle del pedido</div>
      <table class="items-table">
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <div class="divider"></div>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>$${data.subtotal.toFixed(2)}</span>
      </div>
      ${showDiscount ? `
      <div class="total-row discount">
        <span>Descuento (${Math.round(data.discount * 100)}% OFF)</span>
        <span>-$${discountAmount.toFixed(2)}</span>
      </div>` : ''}
      ${data.shippingCost > 0 ? `
      <div class="total-row">
        <span>Costo de envío</span>
        <span>$${data.shippingCost.toFixed(2)}</span>
      </div>` : ''}
      <div class="total-row grand">
        <span>Total pagado</span>
        <span class="grand-amount">$${(data.total + data.shippingCost).toFixed(2)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      ${Config.restaurant.name} · Gracias por tu preferencia
    </div>
  </div>
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Renders the HTML ticket template and saves it as a PDF.
 * Returns the local `uri` of the generated file.
 */
export async function generateTicketPDF(data: TicketData): Promise<string> {
  const html = buildTicketHTML(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}
