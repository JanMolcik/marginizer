import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input, Button } from '@/components/ui';
import { MarginCell } from './MarginCell';
import { TargetMarginInputs } from './TargetMarginInputs';
import { calculateMarginForTarget, getProductMargin } from '@/lib/calculations';
import { exportToCSV } from '@/lib/parser';
import type { Product, ProductVariants, ProductType } from '@/types';

interface ProductTableProps {
  products: Product[];
  analysisName: string;
  onFilteredProductsChange?: (products: Product[]) => void;
}

type SortField = 'code' | 'name' | 'purchasePrice' | 'price' | 'relativeMargin';
type SortDirection = 'asc' | 'desc';

const variantKeys: (keyof ProductVariants)[] = [
  'color', 'part', 'pdf', 'print', 'size', 'colored', 'monochrome'
];

export function ProductTable({ products, analysisName, onFilteredProductsChange }: ProductTableProps) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('relativeMargin');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [target1, setTarget1] = useState(70);
  const [target2, setTarget2] = useState(75);
  const [activeVariantFilters, setActiveVariantFilters] = useState<Set<string>>(new Set());
  const [activeVisibilityFilters, setActiveVisibilityFilters] = useState<Set<string>>(new Set());
  const [activeProductTypeFilter, setActiveProductTypeFilter] = useState<ProductType | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Get unique variant values for filter chips
  const variantOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};
    for (const key of variantKeys) {
      options[key] = new Set();
    }
    for (const product of products) {
      for (const key of variantKeys) {
        const value = product.variants[key];
        if (value) {
          options[key].add(value);
        }
      }
    }
    return options;
  }, [products]);

  // Get unique visibility values for filter chips
  const visibilityOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {
      variant: new Set(),
      product: new Set(),
    };
    for (const product of products) {
      if (product.visibility?.variant) {
        options.variant.add(product.visibility.variant);
      }
      if (product.visibility?.product) {
        options.product.add(product.visibility.product);
      }
    }
    return options;
  }, [products]);

  // Get available product types
  const availableProductTypes = useMemo(() => {
    const types = new Set<ProductType>();
    for (const product of products) {
      if (product.productType) {
        types.add(product.productType);
      }
    }
    return types;
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.code || '').toLowerCase().includes(searchLower) ||
          (p.name || '').toLowerCase().includes(searchLower)
      );
    }

    // Variant filters
    if (activeVariantFilters.size > 0) {
      result = result.filter((p) => {
        for (const filter of activeVariantFilters) {
          const [key, value] = filter.split(':');
          if (p.variants[key as keyof ProductVariants] === value) {
            return true;
          }
        }
        return false;
      });
    }

    // Visibility filters
    if (activeVisibilityFilters.size > 0) {
      result = result.filter((p) => {
        for (const filter of activeVisibilityFilters) {
          const [key, value] = filter.split(':');
          if (key === 'variant' && p.visibility?.variant === value) {
            return true;
          }
          if (key === 'product' && p.visibility?.product === value) {
            return true;
          }
        }
        return false;
      });
    }

    // Product type filter
    if (activeProductTypeFilter) {
      result = result.filter((p) => p.productType === activeProductTypeFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number = sortField === 'relativeMargin'
        ? getProductMargin(a)
        : a[sortField];
      let bVal: string | number = sortField === 'relativeMargin'
        ? getProductMargin(b)
        : b[sortField];

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = sortDirection === 'asc' ? Infinity : -Infinity;
      if (bVal === null || bVal === undefined) bVal = sortDirection === 'asc' ? Infinity : -Infinity;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, search, sortField, sortDirection, activeVariantFilters, activeVisibilityFilters, activeProductTypeFilter]);

  // Notify parent of filtered products for dynamic stats
  useEffect(() => {
    onFilteredProductsChange?.(filteredProducts);
  }, [filteredProducts, onFilteredProductsChange]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleVariantFilter = (filter: string) => {
    const newFilters = new Set(activeVariantFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveVariantFilters(newFilters);
  };

  const toggleVisibilityFilter = (filter: string) => {
    const newFilters = new Set(activeVisibilityFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveVisibilityFilters(newFilters);
  };

  const toggleProductSelection = (code: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(code)) {
      newSelected.delete(code);
    } else {
      newSelected.add(code);
    }
    setSelectedProducts(newSelected);
  };

  const selectAllFiltered = () => {
    const newSelected = new Set(selectedProducts);
    filteredProducts.forEach((p) => newSelected.add(p.code));
    setSelectedProducts(newSelected);
  };

  const deselectAllFiltered = () => {
    const newSelected = new Set(selectedProducts);
    filteredProducts.forEach((p) => newSelected.delete(p.code));
    setSelectedProducts(newSelected);
  };

  const clearAllFilters = () => {
    setActiveVariantFilters(new Set());
    setActiveVisibilityFilters(new Set());
    setActiveProductTypeFilter(null);
  };

  const selectedFilteredCount = filteredProducts.filter((p) => selectedProducts.has(p.code)).length;
  const productsToExport = selectedProducts.size > 0
    ? filteredProducts.filter((p) => selectedProducts.has(p.code))
    : filteredProducts;

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return new Intl.NumberFormat(i18n.language === 'cs' ? 'cs-CZ' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercent = (num: number, showSign = false) => {
    const sign = showSign && num > 0 ? '+' : '';
    return `${sign}${formatNumber(num)}%`;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const headerClass = 'px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-72">
          <Input
            type="search"
            placeholder={t('analysis.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <TargetMarginInputs
            target1={target1}
            target2={target2}
            onTarget1Change={setTarget1}
            onTarget2Change={setTarget2}
          />

          <Button
            variant="secondary"
            onClick={() => exportToCSV(productsToExport, `${analysisName}-export.csv`)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {selectedProducts.size > 0 ? t('analysis.exportSelected') : t('analysis.exportCSV')}
          </Button>
        </div>
      </div>

      {/* Filter chips and selection controls */}
      {(Object.entries(variantOptions).some(([, values]) => values.size > 0) ||
        Object.entries(visibilityOptions).some(([, values]) => values.size > 0)) && (
        <div className="space-y-3">
          {/* Variant filters */}
          {Object.entries(variantOptions).some(([, values]) => values.size > 0) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('analysis.filters')}:</span>
              {Object.entries(variantOptions).map(([key, values]) =>
                Array.from(values).map((value) => {
                  const filterKey = `${key}:${value}`;
                  const isActive = activeVariantFilters.has(filterKey);
                  return (
                    <button
                      key={filterKey}
                      onClick={() => toggleVariantFilter(filterKey)}
                      className={`
                        px-2.5 py-1 text-xs rounded-full border transition-colors
                        ${isActive
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                        }
                      `}
                    >
                      {t(`variants.${key}`)}: {value}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Visibility filters */}
          {Object.entries(visibilityOptions).some(([, values]) => values.size > 0) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('visibility.variant')}:</span>
              {Array.from(visibilityOptions.variant).map((value) => {
                const filterKey = `variant:${value}`;
                const isActive = activeVisibilityFilters.has(filterKey);
                return (
                  <button
                    key={filterKey}
                    onClick={() => toggleVisibilityFilter(filterKey)}
                    className={`
                      px-2.5 py-1 text-xs rounded-full border transition-colors
                      ${isActive
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                      }
                    `}
                  >
                    {value}
                  </button>
                );
              })}
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">{t('visibility.product')}:</span>
              {Array.from(visibilityOptions.product).map((value) => {
                const filterKey = `product:${value}`;
                const isActive = activeVisibilityFilters.has(filterKey);
                return (
                  <button
                    key={filterKey}
                    onClick={() => toggleVisibilityFilter(filterKey)}
                    className={`
                      px-2.5 py-1 text-xs rounded-full border transition-colors
                      ${isActive
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                      }
                    `}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}

          {/* Product type filter */}
          {availableProductTypes.size > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('productType.label')}:</span>
              {(['print', 'pdf', 'unknown'] as ProductType[]).map((type) => {
                if (!availableProductTypes.has(type)) return null;
                const isActive = activeProductTypeFilter === type;
                const colors: Record<ProductType, string> = {
                  print: 'bg-orange-600 border-orange-600',
                  pdf: 'bg-purple-600 border-purple-600',
                  unknown: 'bg-gray-600 border-gray-600',
                };
                return (
                  <button
                    key={type}
                    onClick={() => setActiveProductTypeFilter(isActive ? null : type)}
                    className={`
                      px-2.5 py-1 text-xs rounded-full border transition-colors
                      ${isActive
                        ? `${colors[type]} text-white`
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                      }
                    `}
                  >
                    {t(`productType.${type}`)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Clear filters */}
          {(activeVariantFilters.size > 0 || activeVisibilityFilters.size > 0 || activeProductTypeFilter !== null) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline"
            >
              {t('analysis.clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Selection controls */}
      <div className="flex flex-wrap gap-3 items-center text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          {t('analysis.filteredStats', { filtered: filteredProducts.length, total: products.length })}
        </span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <button
          onClick={selectAllFiltered}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {t('analysis.selectAll')}
        </button>
        <button
          onClick={deselectAllFiltered}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          {t('analysis.deselectAll')}
        </button>
        {selectedProducts.size > 0 && (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {t('analysis.selectedCount', { count: selectedFilteredCount })}
          </span>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && filteredProducts.every((p) => selectedProducts.has(p.code))}
                    onChange={(e) => e.target.checked ? selectAllFiltered() : deselectAllFiltered()}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800"
                  />
                </th>
                <th className={headerClass} onClick={() => handleSort('code')}>
                  {t('table.code')}
                  <SortIcon field="code" />
                </th>
                <th className={headerClass} onClick={() => handleSort('name')}>
                  {t('table.name')}
                  <SortIcon field="name" />
                </th>
                <th className={`${headerClass} text-right`} onClick={() => handleSort('purchasePrice')}>
                  {t('table.purchasePrice')}
                  <SortIcon field="purchasePrice" />
                </th>
                <th className={`${headerClass} text-right`} onClick={() => handleSort('price')}>
                  {t('table.currentPrice')}
                  <SortIcon field="price" />
                </th>
                <th className={`${headerClass} text-center`} onClick={() => handleSort('relativeMargin')}>
                  {t('analysis.currentMargin')}
                  <SortIcon field="relativeMargin" />
                </th>
                <th className={`${headerClass} text-center bg-blue-50 dark:bg-blue-900/20`}>
                  {t('analysis.target')} {target1}%
                </th>
                <th className={`${headerClass} text-center bg-indigo-50 dark:bg-indigo-900/20`}>
                  {t('analysis.target')} {target2}%
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-500 dark:text-slate-400">
                    {t('table.noResults')}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const calc1 = calculateMarginForTarget(product, target1);
                  const calc2 = calculateMarginForTarget(product, target2);
                  const isSelected = selectedProducts.has(product.code);

                  return (
                    <tr key={product.code} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isSelected ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProductSelection(product.code)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800"
                        />
                      </td>
                      <td className="px-3 py-3 text-sm font-mono text-slate-600 dark:text-slate-400">
                        {product.code}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        {product.name}
                      </td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums text-slate-600 dark:text-slate-400">
                        {formatNumber(product.purchasePrice)}
                      </td>
                      <td className="px-3 py-3 text-sm text-right tabular-nums text-slate-900 dark:text-slate-100 font-medium">
                        {formatNumber(product.price)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <MarginCell value={getProductMargin(product)} />
                      </td>
                      <td className="px-3 py-3 bg-blue-50/50 dark:bg-blue-900/20">
                        <div className="text-center">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                            {formatNumber(calc1.newPrice)}
                          </div>
                          <div className={`text-xs tabular-nums ${calc1.priceChangePercent > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {formatPercent(calc1.priceChangePercent, true)}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 bg-indigo-50/50 dark:bg-indigo-900/20">
                        <div className="text-center">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                            {formatNumber(calc2.newPrice)}
                          </div>
                          <div className={`text-xs tabular-nums ${calc2.priceChangePercent > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {formatPercent(calc2.priceChangePercent, true)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
