import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui';

interface TargetMarginInputsProps {
  target1: number;
  target2: number;
  onTarget1Change: (value: number) => void;
  onTarget2Change: (value: number) => void;
}

export function TargetMarginInputs({
  target1,
  target2,
  onTarget1Change,
  onTarget2Change,
}: TargetMarginInputsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-end gap-4">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 pb-2">
        {t('analysis.targetMargins')}:
      </p>
      <div className="w-24">
        <Input
          type="number"
          min={0}
          max={99}
          value={target1}
          onChange={(e) => onTarget1Change(Number(e.target.value))}
          className="text-center"
        />
      </div>
      <span className="text-slate-500 dark:text-slate-400 pb-2">%</span>
      <div className="w-24">
        <Input
          type="number"
          min={0}
          max={99}
          value={target2}
          onChange={(e) => onTarget2Change(Number(e.target.value))}
          className="text-center"
        />
      </div>
      <span className="text-slate-500 dark:text-slate-400 pb-2">%</span>
    </div>
  );
}
