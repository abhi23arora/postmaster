// src/types/types.ts

export interface HistoryItem {
    id: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    url: string;
    timestamp: Date;
    status: number;
    responseTime: number;
    title?: string;
    headers?: Record<string, string>;
    body?: string;
    response?: string;
  }
  
  export interface StressTestResponse {
    iteration: number;
    success: boolean;
    status: number;
    responseTime: number;
    timestamp: Date;
    error?: string;
  }
  
  export interface StressTestResult {
    id: string;
    url: string;
    method: string;
    title: string;
    iterations: number;
    responses: StressTestResponse[];
    avgResponseTime: number;
    successRate: number;
    minResponseTime: number;
    maxResponseTime: number;
  }