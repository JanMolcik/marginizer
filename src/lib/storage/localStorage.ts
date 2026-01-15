import type { MarginAnalysis } from '@/types';
import type { StorageAdapter } from './types';

const STORAGE_KEY = 'product-margins-analyses';

export class LocalStorageAdapter implements StorageAdapter {
  private getAll(): MarginAnalysis[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as MarginAnalysis[];
    } catch {
      return [];
    }
  }

  private setAll(analyses: MarginAnalysis[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
  }

  async getAnalyses(): Promise<MarginAnalysis[]> {
    return this.getAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAnalysis(id: string): Promise<MarginAnalysis | null> {
    const analyses = this.getAll();
    return analyses.find((a) => a.id === id) ?? null;
  }

  async saveAnalysis(analysis: MarginAnalysis): Promise<void> {
    const analyses = this.getAll();
    analyses.push(analysis);
    this.setAll(analyses);
  }

  async deleteAnalysis(id: string): Promise<void> {
    const analyses = this.getAll();
    this.setAll(analyses.filter((a) => a.id !== id));
  }

  async updateAnalysis(id: string, data: Partial<MarginAnalysis>): Promise<void> {
    const analyses = this.getAll();
    const index = analyses.findIndex((a) => a.id === id);
    if (index !== -1) {
      analyses[index] = { ...analyses[index], ...data };
      this.setAll(analyses);
    }
  }
}
