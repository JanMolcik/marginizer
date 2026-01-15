import { useTranslation } from 'react-i18next';
import { setStoredLanguage } from '@/i18n';

const languages = [
  { code: 'cs', label: 'CZ' },
  { code: 'en', label: 'EN' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setStoredLanguage(lang.code)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-colors
            ${i18n.language === lang.code
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }
          `}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
