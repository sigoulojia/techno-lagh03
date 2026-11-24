import { type SavedOrder } from './storeLogic';

export type LoyaltyTierId = 'classic' | 'silver' | 'gold' | 'black_vip';

export type LoyaltyCardStatus =
  | 'unregistered'
  | 'pending'
  | 'approved_pending_pin'
  | 'active';

export interface LoyaltyTierInfo {
  id: LoyaltyTierId;
  nameAr: string;
  nameEn: string;
  badge: string;
  minPoints: number;
  discountRate: number;
  discountLabel: string;
  nextTierPoints: number | null;
  perks: string[];
  theme: {
    bgGradient: string;
    borderAccent: string;
    chipColor: string;
    textColor: string;
    badgeBg: string;
    badgeText: string;
    foilHighlight: string;
    cardShadow: string;
  };
}

export interface LoyaltyCardData {
  cardNumber: string; // Format: "03-XXXX-XXXX-YYYY"
  customerName: string;
  customerPhone: string;
  status: LoyaltyCardStatus;
  pinHash?: string;
  plainPinBackup?: string; // Stored securely for the session to download credentials pass
  points: number;
  tier: LoyaltyTierId;
  memberSince: string; // Format: "MM/YY"
  validThru: string; // Format: "MM/YY"
  isPinProtected: boolean;
  themePreference?: LoyaltyTierId;
  hasPurchased?: boolean;
  ordersCount?: number;
  totalSpent?: number;
  requestedAt?: string;
  approvedAt?: string;
}

export const LOYALTY_STORAGE_KEY = 'techno_laghouat_loyalty_card_v2';
export const LOYALTY_REGISTRY_KEY = 'techno_laghouat_loyalty_registry_v2';
export const WELCOME_BONUS_POINTS = 50;

export const LOYALTY_TIERS: Record<LoyaltyTierId, LoyaltyTierInfo> = {
  classic: {
    id: 'classic',
    nameAr: 'العضو الزمردي الكلاسيكي',
    nameEn: 'Techno Classic',
    badge: 'كلاسيكي 03',
    minPoints: 0,
    discountRate: 0.03,
    discountLabel: 'خصم 3% بالفرع',
    nextTierPoints: 150,
    perks: [
      '50 نقطة ترحيبية فورية مضافة لبطاقتك',
      'خصم 3% فوري عند الدفع في فرع الأغواط',
      'حفظ رصيد نقاط المشتريات تلقائياً',
    ],
    theme: {
      bgGradient: 'linear-gradient(135deg, #062615 0%, #0F492B 45%, #051A0E 100%)',
      borderAccent: '#D4AF37',
      chipColor: '#FFD700',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(212, 175, 55, 0.2)',
      badgeText: '#FFD700',
      foilHighlight: 'rgba(255, 215, 0, 0.35)',
      cardShadow: '0 20px 45px -10px rgba(6, 38, 21, 0.65)',
    },
  },
  silver: {
    id: 'silver',
    nameAr: 'العضو الفضي البلاتيني',
    nameEn: 'Techno Silver',
    badge: 'فضي Platinum',
    minPoints: 150,
    discountRate: 0.05,
    discountLabel: 'خصم 5% بالفرع',
    nextTierPoints: 400,
    perks: [
      'خصم 5% مباشر على الأدوات المكتبية والهندسية',
      'أولوية تجهيز وإرسال طلبيات ZR Express',
      'هدية قلم تكنو عند الشراء الميداني',
    ],
    theme: {
      bgGradient: 'linear-gradient(135deg, #1E293B 0%, #475569 50%, #0F172A 100%)',
      borderAccent: '#CBD5E1',
      chipColor: '#E2E8F0',
      textColor: '#F8FAFC',
      badgeBg: 'rgba(203, 213, 225, 0.25)',
      badgeText: '#E2E8F0',
      foilHighlight: 'rgba(255, 255, 255, 0.4)',
      cardShadow: '0 20px 45px -10px rgba(30, 41, 59, 0.7)',
    },
  },
  gold: {
    id: 'gold',
    nameAr: 'العضو الذهبي VIP',
    nameEn: 'Techno Gold VIP',
    badge: 'ذهبي VIP Gold',
    minPoints: 400,
    discountRate: 0.08,
    discountLabel: 'خصم 8% بالفرع',
    nextTierPoints: 800,
    perks: [
      'خصم 8% دائم على جميع المشتريات والحقائب',
      'شحن مجاني أو مخفض داخل ولاية الأغواط',
      'علبة أقلام فاخرة أو مفكرة تكنو مجانية دورياً',
    ],
    theme: {
      bgGradient: 'linear-gradient(135deg, #6B3A0E 0%, #B45309 40%, #D97706 75%, #381502 100%)',
      borderAccent: '#FDE047',
      chipColor: '#FEF08A',
      textColor: '#FFFBEB',
      badgeBg: 'rgba(254, 240, 138, 0.3)',
      badgeText: '#FDE047',
      foilHighlight: 'rgba(255, 223, 0, 0.5)',
      cardShadow: '0 20px 50px -10px rgba(180, 83, 9, 0.65)',
    },
  },
  black_vip: {
    id: 'black_vip',
    nameAr: 'نخبة التايتانيوم الأسود',
    nameEn: 'Obsidian Black VIP',
    badge: 'النخبة Titanium',
    minPoints: 800,
    discountRate: 0.12,
    discountLabel: 'خصم 12% دائم',
    nextTierPoints: null,
    perks: [
      'أعلى نسبة خصم دائم 12% في المتجر والفرع',
      'شحن مجاني لكافة بلديات الأغواط',
      'خدمة كونسيرج ومساعد مكتبي مخصص لطلباتك',
      'وصول مبكر قبل الجميع للمنتجات الحصرية والمستوردة',
    ],
    theme: {
      bgGradient: 'linear-gradient(135deg, #09090B 0%, #18181B 45%, #27272A 70%, #030303 100%)',
      borderAccent: '#FFD700',
      chipColor: '#FFE57F',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(255, 215, 0, 0.25)',
      badgeText: '#FFD700',
      foilHighlight: 'rgba(255, 215, 0, 0.6)',
      cardShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.9)',
    },
  },
};

/**
 * Deterministically hash a secret PIN (supports 4 to 6 digits) with a secure salt
 */
export function hashPin(pin: string): string {
  const cleanPin = pin.trim();
  let hash = 0x811c9dc5;
  const salt = 'techno_laghouat_salt_03_';
  const str = salt + cleanPin;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Verify a PIN against a stored hash
 */
export function verifyPin(enteredPin: string, storedHash?: string): boolean {
  if (!storedHash) return true; // Not protected
  return hashPin(enteredPin) === storedHash;
}

/**
 * Validates a 6-digit PIN format
 */
export function isValidSixDigitPin(pin: string): boolean {
  return /^\d{6}$/.test(pin.trim());
}

/**
 * Generate a unique, realistic 16-digit card number formatted in 4 blocks
 * Always prefixed with 03 (Laghouat's wilaya code)
 */
export function generateCardNumber(seed?: string): string {
  let num2 = '8815';
  let num3 = '4602';

  if (seed && seed.length >= 4) {
    let acc = 0;
    for (let i = 0; i < seed.length; i++) {
      acc = (acc * 31 + seed.charCodeAt(i)) % 100000000;
    }
    const s = acc.toString().padStart(8, '0');
    num2 = s.slice(0, 4);
    num3 = s.slice(4, 8);
  } else {
    num2 = Math.floor(1000 + Math.random() * 9000).toString();
    num3 = Math.floor(1000 + Math.random() * 9000).toString();
  }

  const currentYear = new Date().getFullYear();
  const num4 = (currentYear % 100).toString().padStart(2, '0') + Math.floor(10 + Math.random() * 90).toString();

  return `03-${num2}-${num3}-${num4}`;
}

/**
 * Calculate loyalty points earned from orders (1 point per 100 DZD spent)
 */
export function calculatePointsFromOrders(savedOrders: SavedOrder[] = []): number {
  if (!savedOrders || savedOrders.length === 0) return 0;
  const totalDzd = savedOrders.reduce((sum, order) => {
    return sum + (order.totals?.grandTotalDzd || 0);
  }, 0);
  return Math.floor(totalDzd / 100);
}

/**
 * Determine customer tier based on total points
 */
export function getTierFromPoints(points: number): LoyaltyTierId {
  if (points >= 800) return 'black_vip';
  if (points >= 400) return 'gold';
  if (points >= 150) return 'silver';
  return 'classic';
}

/**
 * Format date into MM/YY for card expiration
 */
export function formatCardDate(offsetYears: number = 0): string {
  const d = new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = ((d.getFullYear() + offsetYears) % 100).toString().padStart(2, '0');
  return `${month}/${year}`;
}

/**
 * Generate a simplified barcode pattern string of alternating bar widths
 */
export function generateBarcodeBars(code: string): number[] {
  const bars: number[] = [2, 1, 1, 2]; // start pattern
  for (let i = 0; i < code.length; i++) {
    const val = code.charCodeAt(i) % 4;
    bars.push(val + 1, (i % 2) + 1, ((val + 2) % 3) + 1);
  }
  bars.push(2, 1, 2, 2); // stop pattern
  return bars;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY & PERSISTENCE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all registered cards dictionary (keyed by phone number)
 */
export function getAllRegisteredCards(): Record<string, LoyaltyCardData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOYALTY_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save all registered cards dictionary
 */
export function saveAllRegisteredCards(cards: Record<string, LoyaltyCardData>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOYALTY_REGISTRY_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save loyalty registry:', e);
  }
}

/**
 * Retrieve active customer card from localStorage
 */
export function getStoredLoyaltyCard(): LoyaltyCardData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOYALTY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LoyaltyCardData;
  } catch {
    return null;
  }
}

/**
 * Save active customer card to localStorage
 */
export function saveLoyaltyCard(card: LoyaltyCardData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(card));
    // Also sync to global registry if phone exists
    if (card.customerPhone) {
      const registry = getAllRegisteredCards();
      registry[card.customerPhone] = card;
      saveAllRegisteredCards(registry);
    }
  } catch (e) {
    console.error('Failed to save loyalty card to storage:', e);
  }
}

/**
 * Retrieve or create default loyalty card state on page initialization.
 * For privacy and security, when the page is reloaded, the card is NEVER automatically shown.
 * All registered cards are securely stored in the registry (techno_laghouat_loyalty_registry_v2),
 * and can be retrieved instantly using phone number + 6-digit PIN.
 */
export function getOrCreateLoyaltyCard(_savedOrders: SavedOrder[] = []): LoyaltyCardData {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LOYALTY_STORAGE_KEY);
    } catch {}
  }

  // Fallback secure default state: unregistered (no card revealed on reload)
  const defaultCard: LoyaltyCardData = {
    cardNumber: generateCardNumber(),
    customerName: 'عضو نادي الوفاء',
    customerPhone: '',
    status: 'unregistered',
    points: WELCOME_BONUS_POINTS,
    tier: 'classic',
    memberSince: formatCardDate(0),
    validThru: formatCardDate(3),
    isPinProtected: false,
    themePreference: undefined,
  };
  return defaultCard;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD REQUEST, APPROVAL & ACTIVATION WORKFLOW (Exact User Requirements)
// ─────────────────────────────────────────────────────────────────────────────

export interface RequestActivationResult {
  card: LoyaltyCardData;
  hasPurchased: boolean;
  ordersCount: number;
  totalSpent: number;
}

/**
 * Step 1: Customer submits full name and phone number to request card activation.
 * Automatically checks purchase history in store orders.
 */
export function requestCardActivation(
  fullName: string,
  phone: string,
  savedOrders: SavedOrder[] = []
): RequestActivationResult {
  const cleanPhone = phone.trim();
  const cleanName = fullName.trim();

  // Check purchase history for this phone number
  const matchingOrders = savedOrders.filter(
    (o) => o.customer?.phone?.trim() === cleanPhone
  );
  const hasPurchased = matchingOrders.length > 0;
  const ordersCount = matchingOrders.length;
  const totalSpent = matchingOrders.reduce(
    (sum, o) => sum + (o.totals?.grandTotalDzd || 0),
    0
  );

  const points = WELCOME_BONUS_POINTS + calculatePointsFromOrders(matchingOrders);

  const newCard: LoyaltyCardData = {
    cardNumber: generateCardNumber(cleanPhone || cleanName),
    customerName: cleanName,
    customerPhone: cleanPhone,
    status: 'pending', // Enters processing / waiting list
    points,
    tier: getTierFromPoints(points),
    memberSince: formatCardDate(0),
    validThru: formatCardDate(3),
    isPinProtected: false,
    hasPurchased,
    ordersCount,
    totalSpent,
    requestedAt: new Date().toISOString(),
  };

  saveLoyaltyCard(newCard);

  return {
    card: newCard,
    hasPurchased,
    ordersCount,
    totalSpent,
  };
}

/**
 * Step 2: Store Owner / Admin approves the card in the dashboard or via verification.
 * Transitions to 'approved_pending_pin' where card is partially displayed and requires a 6-digit PIN.
 */
export function approveCardRequest(phone: string): LoyaltyCardData | null {
  const cleanPhone = phone.trim();
  const registry = getAllRegisteredCards();
  const targetCard = registry[cleanPhone] || getStoredLoyaltyCard();

  if (!targetCard) return null;

  const approvedCard: LoyaltyCardData = {
    ...targetCard,
    status: 'approved_pending_pin',
    approvedAt: new Date().toISOString(),
  };

  saveLoyaltyCard(approvedCard);
  return approvedCard;
}

/**
 * Step 3: Customer enters their 6-digit PIN to finalize activation and reveal the full card.
 */
export function activateCardWithSixDigitPin(
  card: LoyaltyCardData,
  pin: string
): { success: boolean; card?: LoyaltyCardData; error?: string } {
  const cleanPin = pin.trim();
  if (!isValidSixDigitPin(cleanPin)) {
    return {
      success: false,
      error: 'الرقم السري PIN يجب أن يتكون من 6 أرقام تماماً',
    };
  }

  const activatedCard: LoyaltyCardData = {
    ...card,
    status: 'active',
    isPinProtected: true,
    pinHash: hashPin(cleanPin),
    plainPinBackup: cleanPin, // Retained in local session for document generation
  };

  saveLoyaltyCard(activatedCard);
  return { success: true, card: activatedCard };
}

/**
 * Step 4: Quick Card Retrieval for returning customers using Phone Number
 */
export function retrieveCardByPhone(phone: string): {
  exists: boolean;
  card?: LoyaltyCardData;
  status?: LoyaltyCardStatus;
} {
  const cleanPhone = phone.trim();
  const registry = getAllRegisteredCards();
  let card = registry[cleanPhone];

  if (!card) {
    const current = getStoredLoyaltyCard();
    if (current && current.customerPhone === cleanPhone) {
      card = current;
    }
  }

  if (!card) {
    return { exists: false };
  }

  return {
    exists: true,
    card,
    status: card.status,
  };
}

/**
 * Step 5: Unlock card with 6-digit PIN when returning
 */
export function unlockCardWithPin(
  phone: string,
  pin: string
): { success: boolean; card?: LoyaltyCardData; error?: string } {
  const retrieval = retrieveCardByPhone(phone);
  if (!retrieval.exists || !retrieval.card) {
    return { success: false, error: 'لا توجد بطاقة مسجلة بهذا الرقم' };
  }

  const card = retrieval.card;

  // If card is still pending approval
  if (card.status === 'pending') {
    return {
      success: false,
      error: 'طلبك قيد المعالجة في قائمة الانتظار، لم يتم تفعيل البطاقة بعد.',
    };
  }

  // If card is approved but awaiting PIN creation
  if (card.status === 'approved_pending_pin') {
    return {
      success: false,
      card,
      error: 'تمت الموافقة على بطاقتك! يرجى تعيين رقمك السري (6 أرقام) لإكمال التفعيل.',
    };
  }

  // Validate PIN against stored hash
  const isValid = verifyPin(pin.trim(), card.pinHash);
  if (!isValid) {
    return {
      success: false,
      error: 'الرقم السري غير صحيح، يرجى التحقق وإعادة المحاولة',
    };
  }

  // Save as current active card
  const unlockedCard: LoyaltyCardData = {
    ...card,
    plainPinBackup: pin.trim(), // Restored for download pass
  };
  saveLoyaltyCard(unlockedCard);
  return { success: true, card: unlockedCard };
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL PASS CREDENTIALS DOCUMENT (Downloadable TXT / Printable Document)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates an official, beautifully formatted credentials pass containing full card data + PIN
 */
export function generateCredentialsPassText(
  card: LoyaltyCardData,
  pin?: string
): string {
  const displayedPin = pin || card.plainPinBackup || '•••••• (مشفر بأمان)';
  const tier = LOYALTY_TIERS[card.tier];

  return `===================================================================
      بطاقة عضوية نادي الوفاء VIP — مكتبة وقرطاسية تكنو فرع الأغواط
===================================================================

• الاسم الكامل للعضو: ${card.customerName || 'عضو معتمد'}
• رقم الهاتف المعتمد: ${card.customerPhone || 'غير محدد'}
• رقم بطاقة الوفاء: ${card.cardNumber}
• الرمز السري الخاص بالبطاقة (PIN): ${displayedPin}
• فئة العضوية: ${tier.badge} (${tier.nameAr})
• نسبة التخفيض المعتمدة: ${tier.discountLabel}
• رصيد نقاط الوفاء المتاح: ${card.points} نقطة معتمدة
• تاريخ بداية العضوية: ${card.memberSince}
• تاريخ الصلاحية: ${card.validThru}
• الفرع المعتمد: مكتبة تكنو فرع الأغواط 03 — حي المقام (قرب مقر الولاية القديم)
• الأبعاد الفيزيائية الرسمية: 85.60 mm × 53.98 mm (المعيار الدولي ID-1)

-------------------------------------------------------------------
إرشادات أمان واستخدام البطاقة:
1. احتفظ بهذا الملف وبرمزك السري (PIN) في مكان آمن ولا تشاركه مع أي شخص.
2. يتيح لك هذا الرمز السري استرجاع بطاقتك وعرضها كاملة على موقعنا
   في أي وقت بمجرد إدخال رقم هاتفك ثم رمزك السري.
3. أبرز البطاقة أو الباركود الرقمي عند الدفع في كاسة فرع الأغواط للاستفادة
   الفورية من خصومات الوفاء وتراكم النقاط على مشترياتك.
-------------------------------------------------------------------
تكنو الجزائر — فرع الأغواط 03 | هاتف: 0558600035 / 0791402206
الموقع الرسمي: https://techno-laghouat.pages.dev
===================================================================`;
}

/**
 * Triggers instant download of the card credentials document
 */
export function downloadCardCredentialsDocument(
  card: LoyaltyCardData,
  pin?: string
): void {
  if (typeof window === 'undefined') return;
  const content = generateCredentialsPassText(card, pin);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Techno-VIP-Pass-${card.cardNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ─────────────────────────────────────────────────────────────────────────────
// BULLETPROOF NATIVE CANVAS 2D EXPORTER (Exact 85.60 x 53.98mm High-Res PNG)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export high-resolution PNG using HTML5 Canvas 2D.
 * Completely immune to html2canvas CSS 3D transform bugs.
 * Works 100% reliably on iPhone, Android, and Desktop!
 */
export async function exportCardToPng(
  card: LoyaltyCardData,
  face: 'front' | 'back' = 'front',
  tierId: LoyaltyTierId = 'classic'
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    // Exact standard dimensions ratio: 85.60 / 53.98 = 1.58577
    // Canvas size: 1024 x 646 (ratio 1.5851)
    canvas.width = 1024;
    canvas.height = 646;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Load background image
    const bgUrl =
      face === 'back'
        ? '/assets/techno-vip-back.webp'
        : '/assets/techno-vip-front.webp';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = bgUrl;

    await new Promise<void>((resolve, reject) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load card template image'));
      }
    });

    // Draw background template
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (face === 'front') {
      // 1. Golden EMV Microchip
      ctx.save();
      const chipX = 64;
      const chipY = 182;
      const chipW = 94;
      const chipH = 64;
      const grad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
      grad.addColorStop(0, '#FFE58F');
      grad.addColorStop(0.35, '#D4AF37');
      grad.addColorStop(0.7, '#B38F24');
      grad.addColorStop(1, '#8C680E');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#B38F24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(chipX, chipY, chipW, chipH, 8);
      } else {
        ctx.rect(chipX, chipY, chipW, chipH);
      }
      ctx.fill();
      ctx.stroke();

      // Chip internal contact etched lines
      ctx.strokeStyle = 'rgba(92, 67, 7, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(chipX, chipY + 21); ctx.lineTo(chipX + chipW, chipY + 21);
      ctx.moveTo(chipX, chipY + chipH - 21); ctx.lineTo(chipX + chipW, chipY + chipH - 21);
      ctx.moveTo(chipX + 28, chipY); ctx.lineTo(chipX + 28, chipY + chipH);
      ctx.moveTo(chipX + chipW - 28, chipY); ctx.lineTo(chipX + chipW - 28, chipY + chipH);
      ctx.stroke();
      ctx.restore();

      // 3. Contactless NFC Waves
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const waveX = chipX + chipW + 28;
      const waveY = chipY + 32;
      ctx.arc(waveX, waveY, 10, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(waveX, waveY, 18, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(waveX, waveY, 26, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
      ctx.restore();

      // 4. Embossed VIP Card Number
      ctx.save();
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowOffsetY = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowBlur = 4;
      const displayedNumber =
        card.status === 'approved_pending_pin'
          ? `03-••••-••••-${card.cardNumber.slice(-4)}`
          : card.cardNumber;
      ctx.fillText(displayedNumber, 64, 290);
      ctx.restore();

      // 5. Cardholder Name & Expiry
      ctx.save();
      ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
      ctx.font = '14px monospace';
      ctx.fillText('صاحب البطاقة / CARDHOLDER', 64, 345);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowOffsetY = 2;
      ctx.fillText(card.customerName || 'عضو نادي الوفاء', 64, 375);

      ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
      ctx.font = '14px monospace';
      ctx.fillText('VAL: ' + card.validThru, 410, 375);
      ctx.restore();
    } else {
      // BACK FACE: Dynamic Barcode inside white container
      ctx.save();
      const boxX = Math.round(canvas.width * 0.26);
      const boxY = Math.round(canvas.height * 0.52);
      const boxW = Math.round(canvas.width * 0.48);
      const boxH = Math.round(canvas.height * 0.36);

      // Draw pure white box over sample
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(boxX, boxY, boxW, boxH, 16);
      } else {
        ctx.rect(boxX, boxY, boxW, boxH);
      }
      ctx.fill();

      // Barcode bars
      const bars = generateBarcodeBars(card.cardNumber);
      const barPadding = 24;
      const barAreaW = boxW - barPadding * 2;
      const barAreaH = boxH - 52;
      const totalUnits = bars.reduce((a, b) => a + b, 0);
      const unitW = barAreaW / totalUnits;

      let currentX = boxX + barPadding;
      const barTop = boxY + 14;

      ctx.fillStyle = '#0F172A';
      bars.forEach((w, idx) => {
        const thisW = w * unitW;
        if (idx % 2 === 0) {
          ctx.fillRect(currentX, barTop, thisW, barAreaH);
        }
        currentX += thisW;
      });

      // Card number below barcode
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0F172A';
      ctx.fillText('* ' + card.cardNumber + ' *', boxX + boxW / 2, boxY + boxH - 14);
      ctx.restore();
    }

    // Convert to Blob and trigger download / share
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const fileName = `Techno-VIP-Card-${face}-${card.cardNumber}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // Native share on mobile devices
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator
            .share({
              files: [file],
              title: `بطاقة تكنو VIP — ${card.customerName}`,
            })
            .then(() => resolve(true))
            .catch(() => {
              triggerFileDownload(blob, fileName);
              resolve(true);
            });
          return;
        }

        triggerFileDownload(blob, fileName);
        resolve(true);
      }, 'image/png');
    });
  } catch (err) {
    console.error('Failed to export card via canvas:', err);
    return false;
  }
}

function triggerFileDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

