import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPin,
  verifyPin,
  generateCardNumber,
  calculatePointsFromOrders,
  getTierFromPoints,
  formatCardDate,
  generateBarcodeBars,
  LOYALTY_TIERS,
  isValidSixDigitPin,
  requestCardActivation,
  activateCardWithSixDigitPin,
} from './loyaltyLogic';
import { type SavedOrder } from './storeLogic';

test('hashPin and verifyPin securely validate 4-digit PINs', () => {
  const pin = '4821';
  const hashed = hashPin(pin);
  assert.ok(hashed && hashed.length >= 8);
  assert.equal(verifyPin('4821', hashed), true);
  assert.equal(verifyPin('0000', hashed), false);
  assert.equal(verifyPin('1234', hashed), false);
  assert.equal(verifyPin('', undefined), true); // Unprotected
});

test('generateCardNumber produces 4-segment card number starting with 03', () => {
  const num1 = generateCardNumber('0560154663');
  const num2 = generateCardNumber('محمد');
  assert.ok(num1.startsWith('03-'), 'Must start with Laghouat code 03-');
  assert.ok(num2.startsWith('03-'), 'Must start with Laghouat code 03-');
  assert.equal(num1.split('-').length, 4);
  assert.equal(num2.split('-').length, 4);
});

test('calculatePointsFromOrders awards 1 point per 100 DZD accurately', () => {
  const mockOrders: SavedOrder[] = [
    {
      orderId: 'ORD-101',
      createdAtIso: '2026-11-23T10:00:00.000Z',
      statusLabel: 'قيد التجهيز',
      customer: {
        fullName: 'أحمد',
        phone: '0560154663',
        deliveryMethod: 'laghouat_home',
        wilaya: '03 - الأغواط',
        address: 'حي المقام',
        notes: '',
      },
      items: [],
      totals: {
        subtotalDzd: 6500,
        shippingFeeDzd: 500,
        grandTotalDzd: 7000,
        totalItemsCount: 3,
      },
    },
    {
      orderId: 'ORD-102',
      createdAtIso: '2026-11-23T11:00:00.000Z',
      statusLabel: 'قيد التوصيل',
      customer: {
        fullName: 'أحمد',
        phone: '0560154663',
        deliveryMethod: 'laghouat_desk',
        wilaya: '03 - الأغواط',
        address: 'حي المقام',
        notes: '',
      },
      items: [],
      totals: {
        subtotalDzd: 15400,
        shippingFeeDzd: 380,
        grandTotalDzd: 15780,
        totalItemsCount: 5,
      },
    },
  ];

  const points = calculatePointsFromOrders(mockOrders);
  // (7000 + 15780) / 100 = 22780 / 100 = 227 points
  assert.equal(points, 227);
  assert.equal(calculatePointsFromOrders([]), 0);
});

test('getTierFromPoints correctly categorizes classic, silver, gold, and black VIP tiers', () => {
  assert.equal(getTierFromPoints(50), 'classic');
  assert.equal(getTierFromPoints(150), 'silver');
  assert.equal(getTierFromPoints(399), 'silver');
  assert.equal(getTierFromPoints(400), 'gold');
  assert.equal(getTierFromPoints(799), 'gold');
  assert.equal(getTierFromPoints(800), 'black_vip');
  assert.equal(getTierFromPoints(1500), 'black_vip');

  assert.ok(LOYALTY_TIERS.classic.nameAr.includes('كلاسيكي'));
  assert.ok(LOYALTY_TIERS.silver.nameAr.includes('فضي'));
  assert.ok(LOYALTY_TIERS.gold.nameAr.includes('ذهبي'));
  assert.ok(LOYALTY_TIERS.black_vip.nameAr.includes('تايتانيوم'));
});

test('generateBarcodeBars outputs alternating positive bar widths', () => {
  const bars = generateBarcodeBars('TECHNO-03-8821');
  assert.ok(bars.length > 10);
  assert.ok(bars.every((b) => b >= 1 && b <= 4));
});

test('formatCardDate formats valid MM/YY strings', () => {
  const dateStr = formatCardDate(0);
  assert.match(dateStr, /^\d{2}\/\d{2}$/);
});

test('isValidSixDigitPin and 6-digit PIN activation flow', () => {
  assert.equal(isValidSixDigitPin('123456'), true);
  assert.equal(isValidSixDigitPin('000000'), true);
  assert.equal(isValidSixDigitPin('12345'), false); // 5 digits
  assert.equal(isValidSixDigitPin('1234567'), false); // 7 digits
  assert.equal(isValidSixDigitPin('12a456'), false); // non-numeric

  const req = requestCardActivation('أحمد زكي', '0661234567', []);
  assert.equal(req.card.status, 'pending');
  assert.equal(req.card.customerName, 'أحمد زكي');
  assert.equal(req.hasPurchased, false);

  const activationFail = activateCardWithSixDigitPin(req.card, '12345');
  assert.equal(activationFail.success, false);

  const activationSuccess = activateCardWithSixDigitPin(req.card, '654321');
  assert.equal(activationSuccess.success, true);
  assert.equal(activationSuccess.card?.status, 'active');
  assert.equal(activationSuccess.card?.isPinProtected, true);
});


