import React, { useState, useEffect } from 'react';
import StressTestDialog from './StressTestDialog';
import StressTestResults from './StressTestResults';
import { HistoryItem, StressTestResult } from '../../types';
import './Collections.css';
import { useHistory } from '../HistoryContext';

const Collections: React.FC = () => {
  const { historyItems, loadHistory } = useHistory();
  // const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showStressTestDialog, setShowStressTestDialog] = useState(false);
  const [stressTestResults, setStressTestResults] = useState<StressTestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    // loadHistoryItems();
  }, []);

  // const loadHistoryItems = async () => {
  //   try {
  //     // This would be your actual method to load history from storage
  //     // For now, using mock data
  //     const mockHistory: HistoryItem[] = [
  //       {
  //         id: '1',
  //         method: 'GET',
  //         url: 'https://jsonplaceholder.typicode.com/todos/1',
  //         timestamp: new Date('2025-06-08T10:30:00'),
  //         status: 200,
  //         responseTime: 150,
  //         title: 'Get Todo 1'
  //       },
  //       {
  //         id: '2',
  //         method: 'POST',
  //         url: 'https://jsonplaceholder.typicode.com/posts',
  //         timestamp: new Date('2025-06-08T11:00:00'),
  //         status: 201,
  //         responseTime: 230,
  //         title: 'Create Post'
  //       },
  //       {
  //         id: '3',
  //         method: 'GET',
  //         url: 'https://jsonplaceholder.typicode.com/users',
  //         timestamp: new Date('2025-06-08T11:30:00'),
  //         status: 200,
  //         responseTime: 180,
  //         title: 'Get Users'
  //       }
  //     ];
  //     setHistoryItems(mockHistory);
  //   } catch (error) {
  //     console.error('Failed to load history items:', error);
  //   }
  // };

  const handleItemSelect = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === historyItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(historyItems.map(item => item.id)));
    }
  };

  const handleStressTest = async (iterations: number) => {
    const selectedHistoryItems = historyItems.filter(item => selectedItems.has(item.id));
    setIsRunningTest(true);
    setStressTestResults([]);
    
    try {
      const results: StressTestResult[] = [];
      
      for (const item of selectedHistoryItems) {
        const result: StressTestResult = {
          id: item.id,
          url: item.url,
          method: item.method,
          title: item.title?.toString() ?? '' ,
          iterations,
          responses: [],
          avgResponseTime: 0,
          successRate: 0,
          minResponseTime: 0,
          maxResponseTime: 0
        };

        // Run the stress test for this item
        const responses = await runStressTestForItem(item, iterations);
        result.responses = responses;
        
        // Calculate statistics
        const successfulResponses = responses.filter(r => r.success);
        const responseTimes = responses.map(r => r.responseTime);
        
        result.successRate = (successfulResponses.length / responses.length) * 100;
        result.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        result.minResponseTime = Math.min(...responseTimes);
        result.maxResponseTime = Math.max(...responseTimes);
        
        results.push(result);
      }
      
      setStressTestResults(results);
    } catch (error) {
      console.error('Stress test failed:', error);
    } finally {
      setIsRunningTest(false);
      setShowStressTestDialog(false);
    }
  };

  const runStressTestForItem = async (item: HistoryItem, iterations: number) => {
    const responses = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const endTime = Date.now();
        responses.push({
          iteration: i + 1,
          success: response.ok,
          status: response.status,
          responseTime: endTime - startTime,
          timestamp: new Date()
        });
      } catch (error) {
        const endTime = Date.now();
        responses.push({
          iteration: i + 1,
          success: false,
          status: 0,
          responseTime: endTime - startTime,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return responses;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  return (
    <div className="collections-container">
      <div className="collections-header">
        <h2>API Collections</h2>
        <div className="collections-actions">
          <button 
            className="select-all-btn"
            onClick={handleSelectAll}
          >
            {selectedItems.size === historyItems.length ? 'Deselect All' : 'Select All'}
          </button>
          <button 
            className="stress-test-btn"
            onClick={() => setShowStressTestDialog(true)}
            disabled={selectedItems.size === 0}
          >
            Stress Test ({selectedItems.size})
          </button>
        </div>
      </div>

      <div className="history-list">
        {historyItems.map(item => (
          <div key={item.id} className="history-item">
            <div className="item-checkbox">
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => handleItemSelect(item.id)}
              />
            </div>
            <div className="item-method">
              <span className={`method-badge ${item.method.toLowerCase()}`}>
                {item.method}
              </span>
            </div>
            <div className="item-details">
              {/* <div className="item-title">{item.title || item.url}</div> */}
              <div className="item-url">{item.url}</div>
              <div className="item-meta">
                <span className="timestamp">{formatDate(item.timestamp)}</span>
                <span className={`status ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
                <span className="response-time">{item.responseTime}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stressTestResults.length > 0 && (
        <StressTestResults results={stressTestResults} />
      )}

      {showStressTestDialog && (
        <StressTestDialog
          onClose={() => setShowStressTestDialog(false)}
          onStart={handleStressTest}
          selectedCount={selectedItems.size}
          isRunning={isRunningTest}
        />
      )}
    </div>
  );
};

export default Collections;