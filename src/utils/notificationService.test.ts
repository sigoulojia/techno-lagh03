import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNtfyMessage,
  buildTelegramMessage,
  buildLoyaltyCardTelegramMessage,
  buildLoyaltyCardNtfyMessage,
  createSampleTestOrder,
  escapeHtml,
  maskPhoneNumber,
} from './notificationService';

test('escapeHtml properly sanitizes text', () => {
  assert.equal(escapeHtml('<script>alert("xss")&</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&amp;&lt;/script&gt;');
});

test('maskPhoneNumber conceals sensitive middle digits to protect against Telegram bot bans', () => {
  assert.equal(maskPhoneNumber('0661234567'), '06 •• •• •• 67');
  assert.equal(maskPhoneNumber('0770112233'), '07 •• •• •• 33');
  assert.equal(maskPhoneNumber('123'), '•••');
});

test('buildTelegramMessage in safeMode shields phone number and provides ntfy bridge', () => {
  const sample = createSampleTestOrder();
  const telegramHtml = buildTelegramMessage(sample, {
    safeMode: true,
    ntfyUrl: 'https://ntfy.sh/test-topic',
  });

  // Verify safe mode is applied
  assert.ok(telegramHtml.includes('06 •• •• •• 67'));
  assert.ok(!telegramHtml.includes('0661234567')); // Raw phone must NOT be present
  assert.ok(telegramHtml.includes('TL-TEST'));
  assert.ok(telegramHtml.includes('12,500 د.ج'));
  assert.ok(telegramHtml.includes('https://ntfy.sh/test-topic'));
  assert.ok(telegramHtml.includes('حماية الحساب ضد الحظر'));
});

test('buildTelegramMessage in unmasked mode reveals raw phone if safeMode is explicitly false', () => {
  const sample = createSampleTestOrder();
  const telegramHtml = buildTelegramMessage(sample, {
    safeMode: false,
    ntfyUrl: 'https://ntfy.sh/test-topic',
  });

  assert.ok(telegramHtml.includes('0661234567'));
});

test('buildNtfyMessage contains complete unredacted customer data and order breakdown', () => {
  const sample = createSampleTestOrder();
  const ntfyText = buildNtfyMessage(sample);

  assert.ok(ntfyText.includes('TL-TEST'));
  assert.ok(ntfyText.includes('0661234567')); // Full phone must be in ntfy
  assert.ok(ntfyText.includes('طلب تجريبي للنظام'));
  assert.ok(ntfyText.includes('حي الوئام، وسط المدينة، الأغواط'));
  assert.ok(ntfyText.includes('حقيبة تكنو PROBAG-04'));
  assert.ok(ntfyText.includes('12,500 د.ج'));
});

test('buildLoyaltyCardTelegramMessage safely masks phone number to protect bot against bans', () => {
  const data = {
    customerName: 'محمد زكي',
    customerPhone: '0560154663',
    hasPurchased: true,
    ordersCount: 3,
    totalSpent: 4500,
    cardNumber: '03-8815-4602-2612',
  };
  const tgMsg = buildLoyaltyCardTelegramMessage(data, 'https://ntfy.sh/test-topic');

  // Phone must be masked
  assert.ok(tgMsg.includes('05 •• •• •• 63'));
  assert.ok(!tgMsg.includes('0560154663')); // Raw phone must NOT be present
  assert.ok(tgMsg.includes('محمد زكي'));
  assert.ok(tgMsg.includes('اشترى سابقاً (3 طلبات'));
  assert.ok(tgMsg.includes('03-8815-4602-2612'));
  assert.ok(tgMsg.includes('https://ntfy.sh/test-topic'));
});

test('buildLoyaltyCardNtfyMessage contains complete unmasked phone number and full data', () => {
  const data = {
    customerName: 'محمد زكي',
    customerPhone: '0560154663',
    hasPurchased: false,
    ordersCount: 0,
    totalSpent: 0,
    cardNumber: '03-8815-4602-2612',
  };
  const ntfyMsg = buildLoyaltyCardNtfyMessage(data);

  // Full unmasked phone must be present in Ntfy
  assert.ok(ntfyMsg.includes('0560154663'));
  assert.ok(ntfyMsg.includes('محمد زكي'));
  assert.ok(ntfyMsg.includes('زبون جديد'));
  assert.ok(ntfyMsg.includes('03-8815-4602-2612'));
});
