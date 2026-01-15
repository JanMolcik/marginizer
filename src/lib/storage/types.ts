import type { MarginAnalysis } from '@/types';

export interface StorageAdapter {
  getAnalyses(): Promise<MarginAnalysis[]>;
  getAnalysis(id: string): Promise<MarginAnalysis | null>;
  saveAnalysis(analysis: MarginAnalysis): Promise<void>;
  deleteAnalysis(id: string): Promise<void>;
  updateAnalysis(id: string, data: Partial<MarginAnalysis>): Promise<void>;
}
