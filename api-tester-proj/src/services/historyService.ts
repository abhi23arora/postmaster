// src/services/historyService.ts

import { HistoryItem } from '../types';

export class HistoryService {
  private static instance: HistoryService;
  private historyItems: HistoryItem[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  private loadFromStorage(): void {
    try {
      // In Electron, you would use electron-store or file system
      // For now, using localStorage as fallback
      const stored = localStorage.getItem('api-history');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.historyItems = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load history from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('api-history', JSON.stringify(this.historyItems));
    } catch (error) {
      console.error('Failed to save history to storage:', error);
    }
  }

  public getAllItems(): HistoryItem[] {
    return [...this.historyItems].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public addItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
    const newItem: HistoryItem = {
      ...item,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    this.historyItems.push(newItem);
    this.saveToStorage();
    return newItem;
  }

  public getItem(id: string): HistoryItem | undefined {
    return this.historyItems.find(item => item.id === id);
  }

  public deleteItem(id: string): boolean {
    const index = this.historyItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.historyItems.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public clearHistory(): void {
    this.historyItems = [];
    this.saveToStorage();
  }

  public getItemsByMethod(method: string): HistoryItem[] {
    return this.historyItems.filter(item => item.method === method);
  }

  public getItemsByUrl(url: string): HistoryItem[] {
    return this.historyItems.filter(item => item.url.includes(url));
  }

  public getItemsByDateRange(startDate: Date, endDate: Date): HistoryItem[] {
    return this.historyItems.filter(item => 
      item.timestamp >= startDate && item.timestamp <= endDate
    );
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Method to integrate with your existing API testing functionality
  public recordApiCall(
    method: HistoryItem['method'],
    url: string,
    status: number,
    responseTime: number,
    options?: {
      title?: string;
      headers?: Record<string, string>;
      body?: string;
      response?: string;
    }
  ): HistoryItem {
    return this.addItem({
      method,
      url,
      status,
      responseTime,
      title: options?.title,
      headers: options?.headers,
      body: options?.body,
      response: options?.response
    });
  }
}