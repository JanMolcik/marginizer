import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Card, Badge } from '@/components/ui';
import type { MarginAnalysis } from '@/types';

interface AnalysisCardProps {
  analysis: MarginAnalysis;
  onDelete: (id: string) => void;
}

export function AnalysisCard({ analysis, onDelete }: AnalysisCardProps) {
  const { t, i18n } = useTranslation();

  const formattedDate = new Date(analysis.createdAt).toLocaleDateString(
    i18n.language === 'cs' ? 'cs-CZ' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(t('common.confirm') + '?')) {
      onDelete(analysis.id);
    }
  };

  return (
    <Link to="/analysis/$analysisId" params={{ analysisId: analysis.id }}>
      <Card hoverable className="h-full">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                {analysis.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {analysis.fileName}
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
              aria-label={t('common.delete')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400">{t('dashboard.products')}</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{analysis.summary.totalProducts}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">{t('dashboard.avgMargin')}</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {(analysis.summary.avgMargin ?? 0).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {analysis.summary.lowMarginCount > 0 && (
              <Badge variant="danger">
                {analysis.summary.lowMarginCount} {t('dashboard.lowMargin')}
              </Badge>
            )}
            {analysis.summary.highMarginCount > 0 && (
              <Badge variant="success">
                {analysis.summary.highMarginCount} 70%+
              </Badge>
            )}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            {t('dashboard.created')}: {formattedDate}
          </p>
        </div>
      </Card>
    </Link>
  );
}
