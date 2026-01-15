import { Badge } from '@/components/ui';
import { getMarginHealth } from '@/lib/calculations';

interface MarginCellProps {
  value: number;
  showBadge?: boolean;
}

export function MarginCell({ value, showBadge = true }: MarginCellProps) {
  // Handle null/NaN values
  if (value === null || value === undefined || isNaN(value)) {
    return <span className="text-slate-400 dark:text-slate-500">-</span>;
  }

  const health = getMarginHealth(value);

  const badgeVariant = {
    low: 'danger',
    medium: 'warning',
    good: 'success',
  } as const;

  if (showBadge) {
    return (
      <Badge variant={badgeVariant[health]}>
        {value.toFixed(1)}%
      </Badge>
    );
  }

  const textColor = {
    low: 'text-red-600 dark:text-red-400',
    medium: 'text-amber-600 dark:text-amber-400',
    good: 'text-emerald-600 dark:text-emerald-400',
  };

  return (
    <span className={`font-medium tabular-nums ${textColor[health]}`}>
      {value.toFixed(1)}%
    </span>
  );
}
