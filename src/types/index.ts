export interface ProductVariants {
  color?: string;
  part?: string;
  pdf?: string;
  print?: string;
  size?: string;
  colored?: string;
  monochrome?: string;
}

export interface ProductVisibility {
  variant: string;
  product: string;
}

export type ProductType = 'print' | 'pdf' | 'unknown';

export interface Product {
  code: string;
  pairCode: string;
  name: string;
  price: number;
  priceRatio: number;
  standardPrice: number;
  purchasePrice: number;
  includingVat: boolean;
  percentVat: number;
  relativeMargin: number;
  absoluteMargin: number;
  variants: ProductVariants;
  visibility: ProductVisibility;
  productType: ProductType;
}

export interface AnalysisSummary {
  totalProducts: number;
  avgMargin: number;
  lowMarginCount: number;
  mediumMarginCount: number;
  highMarginCount: number;
}

export interface MarginAnalysis {
  id: string;
  name: string;
  fileName: string;
  createdAt: string;
  products: Product[];
  summary: AnalysisSummary;
}

export interface MarginTarget {
  id: string;
  percentage: number;
}

export interface CalculatedMargin {
  targetPercentage: number;
  newPrice: number;
  priceChange: number;
  priceChangePercent: number;
}
