export type ProductSeries = string;
export type ProductColorFamily =
  | 'black'
  | 'brown'
  | 'blue'
  | 'red'
  | 'green'
  | 'other'
  | string;

export interface StoreCategory {
  id: string;
  name: string;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  priceDzd: number;
  sku?: string;
  name?: string;
  description?: string;
  image?: string;
  dimensions?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  shortName: string;
  brand: string;
  series: ProductSeries;
  seriesLabel: string;
  categoryId?: string;
  categoryName?: string;
  colorFamily?: ProductColorFamily;
  colorName?: string;
  colorHex?: string;
  priceDzd: number;
  image: string;
  images?: string[];
  dimensions?: string;
  variants?: ProductVariant[];
  alt: string;
  summary: string;
  description: string;
  availabilityText: string;
  featuredRank: number;
  siblingIds: string[];
  specs: ProductSpec[];
  highlights: string[];
}

export const DEFAULT_CATEGORIES: StoreCategory[] = [];
export const DEFAULT_PRODUCTS: Product[] = [];
