import test from 'node:test';
import assert from 'node:assert/strict';
import { generateReceiptHtml, downloadOrderReceipt, printOrderReceipt } from './receiptGenerator';
import { createSampleTestOrder } from './notificationService';

test('generateReceiptHtml outputs clean, complete branded HTML invoice', () => {
  const sample = createSampleTestOrder();
  const html = generateReceiptHtml(sample);

  assert.ok(html.includes('TL-TEST'));
  assert.ok(html.includes('طلب تجريبي للنظام'));
  assert.ok(html.includes('0661234567'));
  assert.ok(html.includes('12,500 د.ج'));
  assert.ok(html.includes('تكنو الأغواط'));
  assert.ok(html.includes('حقيبة تكنو PROBAG-04'));
  assert.ok(html.includes('window.print()'));
});

test('generateReceiptHtml omits print-bar when includePrintBar is false', () => {
  const sample = createSampleTestOrder();
  const html = generateReceiptHtml(sample, false);

  assert.ok(html.includes('TL-TEST'));
  assert.ok(!html.includes('class="print-bar"'));
});

test('downloadOrderReceipt and printOrderReceipt safely handle non-browser runtime without error', async () => {
  const sample = createSampleTestOrder();
  await assert.doesNotReject(async () => {
    await downloadOrderReceipt(sample);
    printOrderReceipt(sample);
  });
});
