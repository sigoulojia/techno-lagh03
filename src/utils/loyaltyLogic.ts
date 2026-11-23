import { type SavedOrder } from './storeLogic';

export type LoyaltyTierId = 'classic' | 'silver' | 'gold' | 'black_vip';

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
  pinHash?: string;
  points: number;
  tier: LoyaltyTierId;
  memberSince: string; // Format: "MM/YY"
  validThru: string; // Format: "MM/YY"
  isPinProtected: boolean;
  themePreference?: LoyaltyTierId;
}

export const LOYALTY_STORAGE_KEY = 'techno_laghouat_loyalty_card_v1';
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
 * Deterministically hash a 4-digit PIN with a salt
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
 * Verify a 4-digit PIN against a stored hash
 */
export function verifyPin(enteredPin: string, storedHash?: string): boolean {
  if (!storedHash) return true; // Not protected
  return hashPin(enteredPin) === storedHash;
}

/**
 * Generate a unique, realistic 16-digit card number formatted in 4 blocks
 * Always prefixed with 03 (Laghouat's wilaya code)
 */
export function generateCardNumber(seed?: string): string {
  let num1 = '03';
  let num2 = '88';
  let num3 = '15';
  let num4 = '46';

  if (seed && seed.length >= 4) {
    let acc = 0;
    for (let i = 0; i < seed.length; i++) {
      acc = (acc * 31 + seed.charCodeAt(i)) % 100000000;
    }
    const s = acc.toString().padStart(8, '0');
    num2 = s.slice(0, 2) + s.slice(2, 4);
    num3 = s.slice(4, 6) + s.slice(6, 8);
  } else {
    num2 = Math.floor(1000 + Math.random() * 9000).toString();
    num3 = Math.floor(1000 + Math.random() * 9000).toString();
  }

  const currentYear = new Date().getFullYear();
  num4 = (currentYear % 100).toString().padStart(2, '0') + Math.floor(10 + Math.random() * 90).toString();

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
 * Retrieve or create the customer's loyalty card from localStorage or saved orders
 */
export function getOrCreateLoyaltyCard(savedOrders: SavedOrder[] = []): LoyaltyCardData {
  if (typeof window === 'undefined') {
    return createDefaultCard('عضو نادي الوفاء', '', 0);
  }

  try {
    const raw = localStorage.getItem(LOYALTY_STORAGE_KEY);
    if (raw) {
      const parsed: LoyaltyCardData = JSON.parse(raw);
      // Re-evaluate points if new orders were made
      const orderPoints = calculatePointsFromOrders(savedOrders);
      const totalPoints = Math.max(parsed.points, WELCOME_BONUS_POINTS + orderPoints);
      const currentTier = getTierFromPoints(totalPoints);
      
      const updated: LoyaltyCardData = {
        ...parsed,
        points: totalPoints,
        tier: currentTier,
      };

      // Auto-fill customer name if missing and available in orders
      if (!updated.customerName || updated.customerName === 'عضو نادي الوفاء') {
        const latestOrder = savedOrders[0];
        if (latestOrder?.customer?.fullName) {
          updated.customerName = latestOrder.customer.fullName;
        }
      }
      if (!updated.customerPhone) {
        const latestOrder = savedOrders[0];
        if (latestOrder?.customer?.phone) {
          updated.customerPhone = latestOrder.customer.phone;
        }
      }

      return updated;
    }
  } catch {
    // fallback to new card on parse error
  }

  // Create brand new card
  const latestOrder = savedOrders[0];
  const initialName = latestOrder?.customer?.fullName || 'عضو نادي الوفاء';
  const initialPhone = latestOrder?.customer?.phone || '';
  const orderPoints = calculatePointsFromOrders(savedOrders);
  const initialPoints = WELCOME_BONUS_POINTS + orderPoints;

  const newCard = createDefaultCard(initialName, initialPhone, initialPoints);
  saveLoyaltyCard(newCard);
  return newCard;
}

/**
 * Helper to build default card data structure
 */
function createDefaultCard(name: string, phone: string, points: number): LoyaltyCardData {
  return {
    cardNumber: generateCardNumber(phone || name),
    customerName: name,
    customerPhone: phone,
    points,
    tier: getTierFromPoints(points),
    memberSince: formatCardDate(0),
    validThru: formatCardDate(3), // 3 years validity
    isPinProtected: false,
    themePreference: undefined,
  };
}

/**
 * Persist loyalty card to localStorage
 */
export function saveLoyaltyCard(card: LoyaltyCardData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(card));
  } catch (e) {
    console.error('Failed to save loyalty card to storage:', e);
  }
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
