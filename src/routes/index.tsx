import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardHeader, CardContent } from '@/components/ui';
import { AnalysisList } from '@/components/Dashboard';
import { DropZone } from '@/components/FileUpload';
import { storage } from '@/lib/storage';
import type { MarginAnalysis } from '@/types';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const [analyses, setAnalyses] = useState<MarginAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const loadAnalyses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storage.getAnalyses();
      setAnalyses(data);
    } catch (error) {
      console.error('Failed to load analyses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  const handleDelete = async (id: string) => {
    try {
      await storage.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    loadAnalyses();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t('dashboard.title')}
        </h1>
        {analyses.length > 0 && !showUpload && (
          <Button onClick={() => setShowUpload(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('nav.newAnalysis')}
          </Button>
        )}
      </div>

      {showUpload ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-slate-900">
              {t('upload.title')}
            </h2>
          </CardHeader>
          <CardContent>
            <DropZone
              onUploadComplete={handleUploadComplete}
              onCancel={() => setShowUpload(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <AnalysisList
          analyses={analyses}
          onDelete={handleDelete}
          onUploadClick={() => setShowUpload(true)}
        />
      )}
    </div>
  );
}
