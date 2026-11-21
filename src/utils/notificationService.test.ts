import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNtfyMessage,
  buildTelegramMessage,
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
