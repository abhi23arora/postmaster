import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { promises as fs } from 'fs';

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

let mainWindow: BrowserWindow;
const historyFile = path.join(app.getPath('userData'), 'api-history-test.json');

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

// IPC handlers
ipcMain.handle('make-api-request', async (event, request: ApiRequest): Promise<ApiResponse> => {
  const startTime = Date.now();
  
  try {
    // Build URL with params
    const url = new URL(request.url);
    Object.entries(request.params).forEach(([key, value]) => {
      if (key && value) {
        url.searchParams.append(key, value);
      }
    });

    // Prepare fetch options
    const options: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...request.headers,
      },
    };

    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase()) && request.body) {
      options.body = request.body;
    }

    const response = await fetch(url.toString(), options);
    const responseTime = Date.now() - startTime;
    
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    const apiResponse: ApiResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      time: responseTime,
    };

    // Save to history
    await saveToHistory(request, apiResponse);

    return apiResponse;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorResponse: ApiResponse = {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      time: responseTime,
    };

    await saveToHistory(request, errorResponse);
    return errorResponse;
  }
});

ipcMain.handle('get-history', async (): Promise<Array<ApiRequest & { response?: ApiResponse }>> => {
  try {
    const data = await fs.readFile(historyFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
});

ipcMain.handle('clear-history', async (): Promise<void> => {
  try {
    await fs.writeFile(historyFile, '[]');
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
});

async function saveToHistory(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    let history: Array<ApiRequest & { response?: ApiResponse }> = [];
    
    try {
      const data = await fs.readFile(historyFile, 'utf-8');
      history = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
    }

    history.unshift({ ...request, response });
    
    // Keep only last 100 requests
    if (history.length > 100) {
      history = history.slice(0, 100);
    }

    await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}