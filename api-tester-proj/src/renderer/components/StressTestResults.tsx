import React, { useState } from 'react';
import { StressTestResult } from '../../types';
import './StressTestResults.css';

interface StressTestResultsProps {
  results: StressTestResult[];
}

const StressTestResults: React.FC<StressTestResultsProps> = ({ results }) => {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'excellent';
    if (rate >= 80) return 'good';
    if (rate >= 60) return 'warning';
    return 'poor';
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `stress-test-results-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="stress-test-results">
      <div className="results-header">
        <h3>Stress Test Results</h3>
        <button className="export-btn" onClick={exportResults}>
          Export Results
        </button>
      </div>

      <div className="results-summary">
        <div className="summary-card">
          <h4>Overall Statistics</h4>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total APIs Tested:</span>
              <span className="stat-value">{results.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Requests:</span>
              <span className="stat-value">
                {results.reduce((sum, r) => sum + r.iterations, 0)}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Average Success Rate:</span>
              <span className="stat-value">
                {(results.reduce((sum, r) => sum + r.successRate, 0) / results.length).toFixed(1)}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Average Response Time:</span>
              <span className="stat-value">
                {(results.reduce((sum, r) => sum + r.avgResponseTime, 0) / results.length).toFixed(0)}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="results-list">
        {results.map(result => (
          <div key={result.id} className="result-item">
            <div 
              className="result-header"
              onClick={() => toggleExpanded(result.id)}
            >
              <div className="result-basic-info">
                <span className={`method-badge ${result.method.toLowerCase()}`}>
                  {result.method}
                </span>
                <span className="result-title">{result.title}</span>
                <span className="result-url">{result.url}</span>
              </div>
              
              <div className="result-stats">
                <div className="stat-item">
                  <span className="stat-label">Success Rate:</span>
                  <span className={`stat-value ${getSuccessRateColor(result.successRate)}`}>
                    {result.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Response:</span>
                  <span className="stat-value">{result.avgResponseTime.toFixed(0)}ms</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Iterations:</span>
                  <span className="stat-value">{result.iterations}</span>
                </div>
              </div>
              
              <div className="expand-icon">
                {expandedResult === result.id ? '▼' : '▶'}
              </div>
            </div>

            {expandedResult === result.id && (
              <div className="result-details">
                <div className="detailed-stats">
                  <div className="stat-row">
                    <div className="stat-item">
                      <span className="stat-label">Min Response Time:</span>
                      <span className="stat-value">{result.minResponseTime}ms</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Max Response Time:</span>
                      <span className="stat-value">{result.maxResponseTime}ms</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Successful Requests:</span>
                      <span className="stat-value">
                        {result.responses.filter(r => r.success).length}/{result.responses.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="response-timeline">
                  <h5>Response Timeline</h5>
                  <div className="timeline-grid">
                    {result.responses.map((response, index) => (
                      <div 
                        key={index}
                        className={`timeline-item ${response.success ? 'success' : 'failure'}`}
                        title={`Iteration ${response.iteration}: ${response.status} - ${response.responseTime}ms${response.error ? ` - ${response.error}` : ''}`}
                      >
                        <div className="timeline-dot"></div>
                        <div className="timeline-info">
                          <span className="iteration">#{response.iteration}</span>
                          <span className="status">{response.status}</span>
                          <span className="time">{response.responseTime}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {result.responses.some(r => r.error) && (
                  <div className="errors-section">
                    <h5>Errors</h5>
                    <div className="errors-list">
                      {result.responses
                        .filter(r => r.error)
                        .map((response, index) => (
                          <div key={index} className="error-item">
                            <span className="error-iteration">Iteration {response.iteration}:</span>
                            <span className="error-message">{response.error}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StressTestResults;