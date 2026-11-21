export interface StorePack {
  id: string;
  sku: string;
  name: string;
  badge: string;
  targetAudience: string;
  tagline: string;
  description: string;
  items: string[];
  originalPriceDzd: number;
  packPriceDzd: number;
  savingsDzd: number;
  imageUrl?: string;
  featured?: boolean;
}

export const INITIAL_PACKS: StorePack[] = [];

