import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { SummaryStats, ProductTable } from '@/components/Analysis';
import { storage } from '@/lib/storage';
import { calculateSummary } from '@/lib/calculations';
import type { MarginAnalysis, Product } from '@/types';

export const Route = createFileRoute('/analysis/$analysisId')({
  component: AnalysisDetail,
});

function AnalysisDetail() {
  const { t } = useTranslation();
  const { analysisId } = Route.useParams();
  const [analysis, setAnalysis] = useState<MarginAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await storage.getAnalysis(analysisId);
        if (!data) {
          setError('Analysis not found');
        } else {
          setAnalysis(data);
          setFilteredProducts(data.products); // Initialize with all products
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [analysisId]);

  const handleFilteredProductsChange = useCallback((products: Product[]) => {
    setFilteredProducts(products);
  }, []);

  // Calculate dynamic summary based on filtered products
  const dynamicSummary = useMemo(() => {
    return calculateSummary(filteredProducts);
  }, [filteredProducts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-500 dark:text-slate-400">{t('common.loading')}</div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Analysis not found'}</p>
        <Link to="/">
          <Button variant="secondary">{t('analysis.backToDashboard')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('analysis.backToDashboard')}
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{analysis.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{analysis.fileName}</p>
      </div>

      <SummaryStats summary={dynamicSummary} />

      <ProductTable
        products={analysis.products}
        analysisName={analysis.name}
        onFilteredProductsChange={handleFilteredProductsChange}
      />
    </div>
  );
}
