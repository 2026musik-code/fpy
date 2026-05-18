import { Drama } from '../services/api';

export interface HistoryItem extends Drama {
  lastWatchedAt: number;
  lastWatchedEpisode?: number;
}

const HISTORY_KEY = 'fypshort_history';

export const historyStore = {
  get: (): HistoryItem[] => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  
  add: (drama: Omit<HistoryItem, 'lastWatchedAt'>) => {
    try {
      const current = historyStore.get();
      const filtered = current.filter(item => item.id !== drama.id);
      
      const newItem: HistoryItem = {
        ...drama,
        lastWatchedAt: Date.now()
      };
      
      const newHistory = [newItem, ...filtered].slice(0, 50); // Keep last 50
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  },
  
  clear: () => {
    localStorage.removeItem(HISTORY_KEY);
  }
};
