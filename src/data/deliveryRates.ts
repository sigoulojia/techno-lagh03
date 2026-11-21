export interface WilayaDeliveryRate {
  code: string;
  nameAr: string;
  nameFr: string;
  homeFeeDzd: number;
  stopDeskFeeDzd: number | null;
  isLocalLaghouat?: boolean;
}

export interface LaghouatBureau {
  nameAr: string;
  nameFr: string;
  homeFeeDzd: number;
  stopDeskFeeDzd: number;
}

/**
 * Official ZR Express local delivery bureaus in Wilaya Laghouat (03).
 * Home delivery (À Domicile): 500 DZD · Stop Desk: 380 DZD.
 */
export const LAGHOUAT_BUREAUS: LaghouatBureau[] = [
  { nameAr: 'الأغواط', nameFr: 'Laghouat', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'آفلو', nameFr: 'Aflou', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'حاسي الرمل', nameFr: "Hassi R'mel", homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'قصر الحيران', nameFr: 'Ksar El Hirane', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'عين ماضي', nameFr: 'Ain Madhi', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'تاجموت', nameFr: 'Tadjemout', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'سيدي مخلوف', nameFr: 'Sidi Makhlouf', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'بن ناصر بن شهرة', nameFr: 'Benacer Benchohra', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'الخنق', nameFr: 'Kheneg', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'العسافية', nameFr: 'El Assafia', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'عين سيدي علي', nameFr: 'Ain Sidi Ali', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'قلتة سيدي سعد', nameFr: 'Gueltat Sidi Saad', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'الحويطة', nameFr: 'El Haouaita', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'تاويالة', nameFr: 'Taouiala', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'الحاج المشري', nameFr: 'Hadj Mechri', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'حاسي الدلاعة', nameFr: 'Hassi Delaa', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'الغيشة', nameFr: 'El Ghicha', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'واد مزي', nameFr: "Oued M'zi", homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'سبقاق', nameFr: 'Sebgag', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'سيدي بوزيد', nameFr: 'Sidi Bouzid', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'وادي مرة', nameFr: 'Oued Morra', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'البيضاء', nameFr: 'El Beidha', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'تاجرونة', nameFr: 'Tadjrouna', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
  { nameAr: 'بريدة', nameFr: 'Brida', homeFeeDzd: 500, stopDeskFeeDzd: 380 },
];

/**
 * Official ZR Express delivery tariffs from TECHNO LAGHOUAT (Home & Stop Desk only).
 * Covering Wilaya 03 (Laghouat) and all supported outside wilayas across Algeria.
 */
export const WILAYA_DELIVERY_RATES: WilayaDeliveryRate[] = [
  { code: '01', nameAr: 'أدرار', nameFr: 'Adrar', homeFeeDzd: 1400, stopDeskFeeDzd: 880 },
  { code: '02', nameAr: 'الشلف', nameFr: 'Chlef', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '03', nameAr: 'الأغواط', nameFr: 'Laghouat', homeFeeDzd: 500, stopDeskFeeDzd: 380, isLocalLaghouat: true },
  { code: '04', nameAr: 'أم البواقي', nameFr: 'Oum El Bouaghi', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '05', nameAr: 'باتنة', nameFr: 'Batna', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '06', nameAr: 'بجاية', nameFr: 'Bejaia', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '07', nameAr: 'بسكرة', nameFr: 'Biskra', homeFeeDzd: 950, stopDeskFeeDzd: 630 },
  { code: '08', nameAr: 'بشار', nameFr: 'Bechar', homeFeeDzd: 1100, stopDeskFeeDzd: 730 },
  { code: '09', nameAr: 'البليدة', nameFr: 'Blida', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '10', nameAr: 'البويرة', nameFr: 'Bouira', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '11', nameAr: 'تمنراست', nameFr: 'Tamanrasset', homeFeeDzd: 1700, stopDeskFeeDzd: 1180 },
  { code: '12', nameAr: 'تبسة', nameFr: 'Tebessa', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '13', nameAr: 'تلمسان', nameFr: 'Tlemcen', homeFeeDzd: 900, stopDeskFeeDzd: 580 },
  { code: '14', nameAr: 'تيارت', nameFr: 'Tiaret', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '15', nameAr: 'تيزي وزو', nameFr: 'Tizi Ouzou', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '16', nameAr: 'الجزائر العاصمة', nameFr: 'Alger', homeFeeDzd: 650, stopDeskFeeDzd: 530 },
  { code: '17', nameAr: 'الجلفة', nameFr: 'Djelfa', homeFeeDzd: 750, stopDeskFeeDzd: 530 },
  { code: '18', nameAr: 'جيجل', nameFr: 'Jijel', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '19', nameAr: 'سطيف', nameFr: 'Setif', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '20', nameAr: 'سعيدة', nameFr: 'Saida', homeFeeDzd: 900, stopDeskFeeDzd: 580 },
  { code: '21', nameAr: 'سكيكدة', nameFr: 'Skikda', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '22', nameAr: 'سيدي بلعباس', nameFr: 'Sidi Bel Abbes', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '23', nameAr: 'عنابة', nameFr: 'Annaba', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '24', nameAr: 'قالمة', nameFr: 'Guelma', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '25', nameAr: 'قسنطينة', nameFr: 'Constantine', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '26', nameAr: 'المدية', nameFr: 'Medea', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '27', nameAr: 'مستغانم', nameFr: 'Mostaganem', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '28', nameAr: 'المسيلة', nameFr: 'MSila', homeFeeDzd: 850, stopDeskFeeDzd: 580 },
  { code: '29', nameAr: 'معسكر', nameFr: 'Mascara', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '30', nameAr: 'ورقلة', nameFr: 'Ouargla', homeFeeDzd: 950, stopDeskFeeDzd: 680 },
  { code: '31', nameAr: 'وهران', nameFr: 'Oran', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '32', nameAr: 'البيض', nameFr: 'El Bayadh', homeFeeDzd: 1100, stopDeskFeeDzd: 680 },
  { code: '34', nameAr: 'برج بوعريريج', nameFr: 'Bordj Bou Arreridj', homeFeeDzd: 800, stopDeskFeeDzd: 530 },
  { code: '35', nameAr: 'بومرداس', nameFr: 'Boumerdes', homeFeeDzd: 800, stopDeskFeeDzd: 530 },
  { code: '36', nameAr: 'الطارف', nameFr: 'El Tarf', homeFeeDzd: 850, stopDeskFeeDzd: 530 },
  { code: '38', nameAr: 'تيسمسيلت', nameFr: 'Tissemsilt', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '39', nameAr: 'الوادي', nameFr: 'El Oued', homeFeeDzd: 950, stopDeskFeeDzd: 680 },
  { code: '40', nameAr: 'خنشلة', nameFr: 'Khenchela', homeFeeDzd: 900, stopDeskFeeDzd: 460 },
  { code: '41', nameAr: 'سوق أهراس', nameFr: 'Souk Ahras', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '42', nameAr: 'تيبازة', nameFr: 'Tipaza', homeFeeDzd: 800, stopDeskFeeDzd: 530 },
  { code: '43', nameAr: 'ميلة', nameFr: 'Mila', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '44', nameAr: 'عين الدفلى', nameFr: 'Ain Defla', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '45', nameAr: 'النعامة', nameFr: 'Naama', homeFeeDzd: 1100, stopDeskFeeDzd: 680 },
  { code: '46', nameAr: 'عين تموشنت', nameFr: 'Ain Temouchent', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '47', nameAr: 'غرداية', nameFr: 'Ghardaia', homeFeeDzd: 850, stopDeskFeeDzd: 580 },
  { code: '48', nameAr: 'غليزان', nameFr: 'Relizane', homeFeeDzd: 900, stopDeskFeeDzd: 530 },
  { code: '49', nameAr: 'تيميمون', nameFr: 'Timimoun', homeFeeDzd: 1400, stopDeskFeeDzd: 880 },
  { code: '51', nameAr: 'أولاد جلال', nameFr: 'Ouled Djellal', homeFeeDzd: 950, stopDeskFeeDzd: 630 },
  { code: '52', nameAr: 'بني عباس', nameFr: 'Beni Abbes', homeFeeDzd: 1000, stopDeskFeeDzd: 880 },
  { code: '53', nameAr: 'عين صالح', nameFr: 'In Salah', homeFeeDzd: 1700, stopDeskFeeDzd: 1180 },
  { code: '54', nameAr: 'عين قزام', nameFr: 'In Guezzam', homeFeeDzd: 1700, stopDeskFeeDzd: null },
  { code: '55', nameAr: 'توقرت', nameFr: 'Touggourt', homeFeeDzd: 950, stopDeskFeeDzd: 680 },
  { code: '57', nameAr: 'المغير', nameFr: 'El Meghaier', homeFeeDzd: 950, stopDeskFeeDzd: null },
  { code: '58', nameAr: 'المنيعة', nameFr: 'El Menia', homeFeeDzd: 1000, stopDeskFeeDzd: 680 },
];

export const DEFAULT_WILAYA_LABEL = '03 - الأغواط';

export function formatWilayaLabel(rate: WilayaDeliveryRate): string {
  return `${rate.code} - ${rate.nameAr}`;
}

export function findWilayaRate(wilayaInput?: string): WilayaDeliveryRate {
  const fallback =
    WILAYA_DELIVERY_RATES.find((w) => w.code === '03') ?? WILAYA_DELIVERY_RATES[0];
  if (!wilayaInput || !wilayaInput.trim()) return fallback;

  const trimmed = wilayaInput.trim();
  const codeMatch = trimmed.match(/^(\d{1,2})\b/);
  if (codeMatch) {
    const padded = codeMatch[1].padStart(2, '0');
    const byCode = WILAYA_DELIVERY_RATES.find((w) => w.code === padded);
    if (byCode) return byCode;
  }

  const lower = trimmed.toLowerCase();
  const byName = WILAYA_DELIVERY_RATES.find(
    (w) =>
      formatWilayaLabel(w).toLowerCase() === lower ||
      w.nameAr.toLowerCase() === lower ||
      w.nameFr.toLowerCase() === lower ||
      lower.includes(w.nameAr.toLowerCase()) ||
      lower.includes(w.nameFr.toLowerCase()),
  );

  return byName ?? fallback;
}

export function isLaghouatWilaya(wilayaInput?: string): boolean {
  return findWilayaRate(wilayaInput).code === '03';
}

export function isStopDeskAvailableForWilaya(wilayaInput?: string): boolean {
  return findWilayaRate(wilayaInput).stopDeskFeeDzd !== null;
}

export function getShippingFeeForWilaya(
  deliveryMethod: string,
  wilayaInput?: string,
): number {
  if (deliveryMethod === 'pickup' || deliveryMethod === 'store_pickup') {
    return 0;
  }
  const rate = findWilayaRate(wilayaInput);
  if (deliveryMethod === 'stop_desk') {
    return rate.stopDeskFeeDzd ?? rate.homeFeeDzd;
  }
  // 'home' or legacy 'laghouat'
  return rate.homeFeeDzd;
}
