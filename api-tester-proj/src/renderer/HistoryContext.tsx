import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HistoryItem } from '../types';

// App-specific types for API requests
interface ApiRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body: string;
  timestamp: number;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

export interface AppHistoryItem extends ApiRequest {
  response?: ApiResponse;
}

// Context interface
interface HistoryContextType {
  appHistory: AppHistoryItem[];
  historyItems: HistoryItem[];
  loadHistory: () => Promise<void>;
  addHistoryItem: (item: AppHistoryItem) => void;
  isLoading: boolean;
}

// Create context
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// Provider component
interface HistoryProviderProps {
  children: ReactNode;
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({ children }) => {
  const [appHistory, setAppHistory] = useState<AppHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert to HistoryItem format for Collections
  const historyItems: HistoryItem[] = appHistory.map(item => ({
    id: item.id,
    method: item.method as HistoryItem['method'],
    url: item.url,
    timestamp: new Date(item.timestamp),
    status: item.response?.status || 0,
    responseTime: item.response?.time || 0,
    title: `${item.method} ${item.url}`,
    headers: item.headers,
    body: item.body,
    response: item.response ? JSON.stringify(item.response.data) : undefined
  }));

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const historyData = await window.electronAPI.getHistory();
      setAppHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHistoryItem = (item: AppHistoryItem) => {
    setAppHistory(prev => [item, ...prev]);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const value: HistoryContextType = {
    appHistory,
    historyItems,
    loadHistory,
    addHistoryItem,
    isLoading
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};

// Custom hook
export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};