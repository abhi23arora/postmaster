import { contextBridge, ipcRenderer } from 'electron';

export interface ApiRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body: string;
  timestamp: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

const electronAPI = {
  makeApiRequest: (request: ApiRequest): Promise<ApiResponse> =>
    ipcRenderer.invoke('make-api-request', request),
  getHistory: (): Promise<Array<ApiRequest & { response?: ApiResponse }>> =>
    ipcRenderer.invoke('get-history'),
  clearHistory: (): Promise<void> =>
    ipcRenderer.invoke('clear-history'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}