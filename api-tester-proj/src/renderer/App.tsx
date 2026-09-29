import React, { useState, useEffect } from 'react';
import './App.css';
import Collections from './components/Collections';
import { useHistory, AppHistoryItem } from './HistoryContext';

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

interface HistoryItem extends ApiRequest {
  response?: ApiResponse;
}

const App: React.FC = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('params');
  const [responseTab, setResponseTab] = useState('pretty');
  const [params, setParams] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  // const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'api-tester' | 'collections'>('api-tester');
  const { appHistory, loadHistory } = useHistory();

  useEffect(() => {
    // loadHistory();
  }, []);

  // const loadHistory = async () => {
  //   try {
  //     const historyData = await window.electronAPI.getHistory();
  //     setHistory(historyData);
  //   } catch (error) {
  //     console.error('Failed to load history:', error);
  //   }
  // };

  const addParam = () => {
    setParams([...params, { key: '', value: '' }]);
  };

  const updateParam = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResponse(null);

    const request: ApiRequest = {
      id: Date.now().toString(),
      method,
      url,
      headers: Object.fromEntries(headers.filter(h => h.key && h.value).map(h => [h.key, h.value])),
      params: Object.fromEntries(params.filter(p => p.key && p.value).map(p => [p.key, p.value])),
      body,
      timestamp: Date.now(),
    };

    try {
      const result = await window.electronAPI.makeApiRequest(request);
      setResponse(result);
      await loadHistory();
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: AppHistoryItem) => {
    setMethod(item.method);
    setUrl(item.url);
    setParams(Object.entries(item.params).map(([key, value]) => ({ key, value })));
    setHeaders(Object.entries(item.headers).map(([key, value]) => ({ key, value })));
    setBody(item.body);
    if (item.response) {
      setResponse(item.response);
    }
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return '#28a745';
    if (status >= 300 && status < 400) return '#ffc107';
    if (status >= 400 && status < 500) return '#fd7e14';
    if (status >= 500) return '#dc3545';
    return '#6c757d';
  };

  return (
    <div className="app">
      <div className="navigation-tabs">
        <button 
          className={`nav-tab ${activeMainTab === 'api-tester' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('api-tester')}
        >
          API Tester
        </button>
        <button 
          className={`nav-tab ${activeMainTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('collections')}
        >
          Collections
        </button>
      </div>

      <div className="main-content">
        {activeMainTab === 'api-tester' && (
          <>
            <div className={`sidebar ${historyCollapsed ? 'collapsed' : ''}`}>
              <div className="sidebar-header">
                {!historyCollapsed && <h3>History</h3>}
                <button 
                  className="collapse-btn"
                  onClick={() => setHistoryCollapsed(!historyCollapsed)}
                >
                  {historyCollapsed ? '▶' : '◀'}
                </button>
              </div>
              {!historyCollapsed && (
                <div className="history-list">
                  {appHistory.map((item) => (
                    <div 
                      key={item.id} 
                      className="history-item"
                      onClick={() => loadFromHistory(item)}
                    >
                      <div className="history-method">{item.method}</div>
                      <div className="history-url">{item.url}</div>
                      <div className="history-time">
                        {formatDate(new Date(item.timestamp))}
                      </div>
                      {item.response && (
                        <div 
                          className="history-status"
                          style={{ color: getStatusColor(item.response.status) }}
                        >
                          {item.response.status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="content-area">
              <div className="request-section">
                <div className="url-bar">
                  <select 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value)}
                    className="method-select"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="url-input"
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={loading || !url.trim()}
                    className="send-btn"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>

                <div className="tabs">
                  <button 
                    className={activeTab === 'params' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('params')}
                  >
                    Params
                  </button>
                  <button 
                    className={activeTab === 'headers' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('headers')}
                  >
                    Headers ({headers.filter(h => h.key && h.value).length})
                  </button>
                  <button 
                    className={activeTab === 'body' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('body')}
                  >
                    Body
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'params' && (
                    <div className="params-section">
                      {params.map((param, index) => (
                        <div key={index} className="param-row">
                          <input
                            type="text"
                            placeholder="Key"
                            value={param.key}
                            onChange={(e) => updateParam(index, 'key', e.target.value)}
                            className="param-input"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) => updateParam(index, 'value', e.target.value)}
                            className="param-input"
                          />
                          <button 
                            onClick={() => removeParam(index)}
                            className="remove-btn"
                            disabled={params.length === 1}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button onClick={addParam} className="add-btn">+ Add Parameter</button>
                    </div>
                  )}

                  {activeTab === 'headers' && (
                    <div className="headers-section">
                      {headers.map((header, index) => (
                        <div key={index} className="param-row">
                          <input
                            type="text"
                            placeholder="Key"
                            value={header.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                            className="param-input"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            className="param-input"
                          />
                          <button 
                            onClick={() => removeHeader(index)}
                            className="remove-btn"
                            disabled={headers.length === 1}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button onClick={addHeader} className="add-btn">+ Add Header</button>
                    </div>
                  )}

                  {activeTab === 'body' && (
                    <div className="body-section">
                      <textarea
                        placeholder="Request body (JSON, XML, etc.)"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="body-textarea"
                        rows={10}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="response-section">
                <div className="response-header">
                  <h3>Response</h3>
                  {response && (
                    <div className="response-info">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(response.status) }}
                      >
                        {response.status} {response.statusText}
                      </span>
                      <span className="time-badge">{response.time}ms</span>
                    </div>
                  )}
                </div>

                {response && (
                  <>
                    <div className="response-tabs">
                      <button 
                        className={responseTab === 'pretty' ? 'tab active' : 'tab'}
                        onClick={() => setResponseTab('pretty')}
                      >
                        Pretty
                      </button>
                      <button 
                        className={responseTab === 'raw' ? 'tab active' : 'tab'}
                        onClick={() => setResponseTab('raw')}
                      >
                        Raw
                      </button>
                      <button 
                        className={responseTab === 'headers' ? 'tab active' : 'tab'}
                        onClick={() => setResponseTab('headers')}
                      >
                        Headers
                      </button>
                    </div>

                    <div className="response-content">
                      {responseTab === 'pretty' && (
                        <pre className="response-body">
                          {formatJson(response.data)}
                        </pre>
                      )}
                      {responseTab === 'raw' && (
                        <pre className="response-body">
                          {typeof response.data === 'string' ? response.data : JSON.stringify(response.data)}
                        </pre>
                      )}
                      {responseTab === 'headers' && (
                        <div className="response-headers">
                          {Object.entries(response.headers).map(([key, value]) => (
                            <div key={key} className="header-row">
                              <strong>{key}:</strong> {value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!response && !loading && (
                  <div className="empty-response">
                    <p>Enter a URL and click Send to see the response</p>
                  </div>
                )}

                {loading && (
                  <div className="loading-response">
                    <p>Sending request...</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {activeMainTab === 'collections' && <Collections />}
      </div>
    </div>
  );
};

export default App;