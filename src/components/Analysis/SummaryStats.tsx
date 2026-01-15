import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import type { AnalysisSummary } from '@/types';

interface SummaryStatsProps {
  summary: AnalysisSummary;
}

export function SummaryStats({ summary }: SummaryStatsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('stats.total'),
      value: summary.totalProducts.toString(),
      color: 'text-slate-900 dark:text-slate-100',
    },
    {
      label: t('stats.avgMargin'),
      value: `${(summary.avgMargin ?? 0).toFixed(1)}%`,
      color: 'text-slate-900 dark:text-slate-100',
    },
    {
      label: t('stats.lowMargin'),
      value: summary.lowMarginCount.toString(),
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: t('stats.mediumMargin'),
      value: summary.mediumMarginCount.toString(),
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: t('stats.highMargin'),
      value: summary.highMarginCount.toString(),
      color: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <Card>
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className={`text-xl font-semibold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
