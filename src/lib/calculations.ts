import type { Product, CalculatedMargin, AnalysisSummary } from '@/types';

/**
 * Calculate the selling price required to achieve a target margin
 * Formula: price = purchasePrice / (1 - targetMargin)
 */
export function calculatePriceForMargin(purchasePrice: number, targetMargin: number): number {
  if (targetMargin >= 1) return Infinity;
  if (targetMargin <= 0) return purchasePrice;
  return purchasePrice / (1 - targetMargin);
}

/**
 * Calculate the margin percentage from price and cost
 * Formula: margin = (price - cost) / price
 */
export function calculateMargin(price: number, purchasePrice: number): number {
  if (price <= 0) return 0;
  return ((price - purchasePrice) / price) * 100;
}

/**
 * Calculate margin data for a specific target percentage
 */
export function calculateMarginForTarget(
  product: Product,
  targetPercentage: number
): CalculatedMargin {
  const targetDecimal = targetPercentage / 100;
  const newPrice = calculatePriceForMargin(product.purchasePrice, targetDecimal);
  const priceChange = newPrice - product.price;
  const priceChangePercent = product.price > 0
    ? (priceChange / product.price) * 100
    : 0;

  return {
    targetPercentage,
    newPrice,
    priceChange,
    priceChangePercent,
  };
}

/**
 * Get the effective margin for a product (use relativeMargin if available, else calculate)
 */
export function getProductMargin(product: Product): number {
  if (typeof product.relativeMargin === 'number' && !isNaN(product.relativeMargin)) {
    return product.relativeMargin;
  }
  // Calculate margin from price and purchase price
  return calculateMargin(product.price || 0, product.purchasePrice || 0);
}

/**
 * Calculate summary statistics for a list of products
 */
export function calculateSummary(products: Product[]): AnalysisSummary {
  if (products.length === 0) {
    return {
      totalProducts: 0,
      avgMargin: 0,
      lowMarginCount: 0,
      mediumMarginCount: 0,
      highMarginCount: 0,
    };
  }

  const margins = products.map((p) => getProductMargin(p));
  const validMargins = margins.filter((m) => typeof m === 'number' && !isNaN(m));
  const avgMargin = validMargins.length > 0
    ? validMargins.reduce((sum, m) => sum + m, 0) / validMargins.length
    : 0;

  return {
    totalProducts: products.length,
    avgMargin,
    lowMarginCount: margins.filter((m) => m < 50).length,
    mediumMarginCount: margins.filter((m) => m >= 50 && m < 70).length,
    highMarginCount: margins.filter((m) => m >= 70).length,
  };
}

/**
 * Get margin health status based on percentage
 */
export function getMarginHealth(margin: number): 'low' | 'medium' | 'good' {
  if (margin < 50) return 'low';
  if (margin < 70) return 'medium';
  return 'good';
}
