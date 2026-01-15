import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { AnalysisCard } from './AnalysisCard';
import type { MarginAnalysis } from '@/types';

interface AnalysisListProps {
  analyses: MarginAnalysis[];
  onDelete: (id: string) => void;
  onUploadClick: () => void;
}

export function AnalysisList({ analyses, onDelete, onUploadClick }: AnalysisListProps) {
  const { t } = useTranslation();

  if (analyses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-400 dark:text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
          {t('dashboard.empty')}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
          {t('dashboard.emptyDescription')}
        </p>
        <Button onClick={onUploadClick}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('dashboard.uploadButton')}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {analyses.map((analysis) => (
        <AnalysisCard
          key={analysis.id}
          analysis={analysis}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
