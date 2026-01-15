import * as XLSX from 'xlsx';
import type { Product, ProductVariants, ProductVisibility, ProductType } from '@/types';

// Column mapping: File header → Product property path
const COLUMN_MAP: Record<string, string> = {
  'code': 'code',
  'pairCode': 'pairCode',
  'name': 'name',
  'price': 'price',
  'priceRatio': 'priceRatio',
  'standardPrice': 'standardPrice',
  'purchasePrice': 'purchasePrice',
  'includingVat': 'includingVat',
  'percentVat': 'percentVat',
  'relativeMargin': 'relativeMargin',
  'absoluteMargin': 'absoluteMargin',
  'variant:Barva': 'variants.color',
  'variant:Díl': 'variants.part',
  'variant:PDF': 'variants.pdf',
  'variant:TISK': 'variants.print',
  'variant:Velikost': 'variants.size',
  'variant:barevná': 'variants.colored',
  'variant:černobílá': 'variants.monochrome',
  'variantVisibility': 'visibility.variant',
  'productVisibility': 'visibility.product',
};

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
}

function parseValue(value: unknown, targetPath: string): unknown {
  if (value === null || value === undefined || value === '') {
    return targetPath.includes('variants.') ? undefined : '';
  }

  // Boolean fields
  if (targetPath === 'includingVat') {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  // Numeric fields
  const numericFields = [
    'price', 'priceRatio', 'standardPrice', 'purchasePrice',
    'percentVat', 'relativeMargin', 'absoluteMargin'
  ];

  if (numericFields.includes(targetPath)) {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }

  return String(value);
}

/**
 * Detect product type (PRINT/PDF) based on:
 * 1. Product code (source of truth) - check for "/TISK" or "/PDF"
 * 2. Fallback to product name if code doesn't indicate type
 *
 * Each product is ALWAYS either "print" or "pdf" (no "both" type).
 * Product code takes priority over product name.
 */
function detectProductType(product: Record<string, unknown>): ProductType {
  const name = (product.name as string || '').toUpperCase();
  const code = (product.code as string || '').toUpperCase();

  // Priority 1: Check product code (source of truth)
  const codeHasTisk = code.includes('/TISK') || code.includes('-TISK') || code.endsWith('TISK');
  const codeHasPdf = code.includes('/PDF') || code.includes('-PDF') || code.endsWith('PDF');

  if (codeHasTisk) return 'print';
  if (codeHasPdf) return 'pdf';

  // Priority 2: Fallback to product name
  const nameHasTisk = name.includes('TISK') || name.includes('PRINT');
  const nameHasPdf = name.includes('PDF');

  if (nameHasTisk) return 'print';
  if (nameHasPdf) return 'pdf';

  return 'unknown';
}

function rowToProduct(row: Record<string, unknown>, headers: string[]): Product {
  const product: Record<string, unknown> = {
    variants: {} as ProductVariants,
    visibility: {} as ProductVisibility,
  };

  for (const header of headers) {
    const targetPath = COLUMN_MAP[header];
    if (targetPath) {
      const value = parseValue(row[header], targetPath);
      setNestedValue(product, targetPath, value);
    }
  }

  // Detect and set product type
  product.productType = detectProductType(product);

  return product as unknown as Product;
}

export async function parseFile(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: '',
        });

        if (jsonData.length === 0) {
          resolve([]);
          return;
        }

        // Get headers from first row keys
        const headers = Object.keys(jsonData[0]);

        // Convert each row to Product
        const products = jsonData.map((row) => rowToProduct(row, headers));

        resolve(products);
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export function exportToCSV(products: Product[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(
    products.map((p) => ({
      code: p.code,
      name: p.name,
      purchasePrice: p.purchasePrice,
      price: p.price,
      relativeMargin: p.relativeMargin,
      absoluteMargin: p.absoluteMargin,
    }))
  );

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
