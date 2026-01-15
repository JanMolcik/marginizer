import { useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';
import { parseFile } from '@/lib/parser';
import { calculateSummary } from '@/lib/calculations';
import { storage } from '@/lib/storage';
import type { Product, MarginAnalysis } from '@/types';

// Security limits
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_PRODUCTS = 1000;
const RATE_LIMIT_MS = 2000; // Min time between uploads
const MAX_ANALYSES = 50; // Max stored analyses

interface DropZoneProps {
  onUploadComplete: () => void;
  onCancel: () => void;
}

export function DropZone({ onUploadComplete, onCancel }: DropZoneProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [analysisName, setAnalysisName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUploadTime = useRef<number>(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = async (selectedFile: File) => {
    setIsLoading(true);
    setError(null);

    // Rate limiting check
    const now = Date.now();
    if (now - lastUploadTime.current < RATE_LIMIT_MS) {
      setError(t('security.rateLimited'));
      setIsLoading(false);
      return;
    }
    lastUploadTime.current = now;

    // File size check
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(t('security.fileTooLarge', { maxSize: MAX_FILE_SIZE_MB }));
      setIsLoading(false);
      return;
    }

    try {
      const parsed = await parseFile(selectedFile);

      // Product count check
      if (parsed.length > MAX_PRODUCTS) {
        setError(t('security.tooManyProducts', { maxProducts: MAX_PRODUCTS }));
        setIsLoading(false);
        return;
      }

      if (parsed.length === 0) {
        setError(t('security.noProducts'));
        setIsLoading(false);
        return;
      }

      setProducts(parsed);
      setFile(selectedFile);
      setAnalysisName(selectedFile.name.replace(/\.(xlsx|csv)$/i, ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && /\.(xlsx|csv)$/i.test(droppedFile.name)) {
      processFile(droppedFile);
    } else {
      setError('Please upload a .xlsx or .csv file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || products.length === 0) return;

    setIsLoading(true);

    try {
      // Check max analyses limit
      const existingAnalyses = await storage.getAnalyses();
      if (existingAnalyses.length >= MAX_ANALYSES) {
        setError(t('security.tooManyAnalyses', { maxAnalyses: MAX_ANALYSES }));
        setIsLoading(false);
        return;
      }

      const analysis: MarginAnalysis = {
        id: crypto.randomUUID(),
        name: analysisName || file.name,
        fileName: file.name,
        createdAt: new Date().toISOString(),
        products,
        summary: calculateSummary(products),
      };

      // Check localStorage quota before saving
      const analysisSize = JSON.stringify(analysis).length;
      const estimatedUsage = analysisSize * 2; // Safety margin

      if (estimatedUsage > 4 * 1024 * 1024) { // 4MB safety limit
        setError(t('security.storageFull'));
        setIsLoading(false);
        return;
      }

      await storage.saveAnalysis(analysis);
      onUploadComplete();
    } catch (err) {
      // Handle quota exceeded error
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        setError(t('security.storageFull'));
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save analysis');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (products.length > 0) {
    return (
      <div className="space-y-6">
        <div>
          <Input
            label={t('upload.fileName')}
            value={analysisName}
            onChange={(e) => setAnalysisName(e.target.value)}
            placeholder={t('upload.fileNamePlaceholder')}
          />
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            {t('upload.preview')} ({products.length} {t('dashboard.products')})
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="pb-2 pr-4">{t('table.code')}</th>
                  <th className="pb-2 pr-4">{t('table.name')}</th>
                  <th className="pb-2 pr-4 text-right">{t('table.purchasePrice')}</th>
                  <th className="pb-2 text-right">{t('table.currentPrice')}</th>
                </tr>
              </thead>
              <tbody className="text-slate-900">
                {products.slice(0, 5).map((product, i) => (
                  <tr key={i} className="border-t border-slate-200">
                    <td className="py-2 pr-4 font-mono text-xs">{product.code}</td>
                    <td className="py-2 pr-4 truncate max-w-[200px]">{product.name}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {product.purchasePrice.toFixed(2)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {product.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length > 5 && (
              <p className="text-xs text-slate-500 mt-2">
                ... and {products.length - 5} more products
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {t('upload.cancel')}
          </Button>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? t('common.loading') : t('upload.import')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-colors
          ${isDragging
            ? 'border-slate-400 bg-slate-50'
            : 'border-slate-300 hover:border-slate-400'
          }
        `}
      >
        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-slate-600">{t('upload.dropzone')}</p>
          <p className="text-sm text-slate-500">{t('upload.formats')}</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {isLoading && (
        <p className="text-sm text-slate-600 text-center">{t('common.loading')}</p>
      )}

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onCancel}>
          {t('upload.cancel')}
        </Button>
      </div>
    </div>
  );
}
