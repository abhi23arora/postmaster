import React, { useState } from 'react';
import './StressTestDialog.css';

interface StressTestDialogProps {
  onClose: () => void;
  onStart: (iterations: number) => void;
  selectedCount: number;
  isRunning: boolean;
}

const StressTestDialog: React.FC<StressTestDialogProps> = ({
  onClose,
  onStart,
  selectedCount,
  isRunning
}) => {
  const [iterations, setIterations] = useState<number>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (iterations > 0 && iterations <= 1000) {
      onStart(iterations);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h3>Stress Test Configuration</h3>
          <button className="close-btn" onClick={onClose} disabled={isRunning}>
            ×
          </button>
        </div>
        
        <div className="dialog-body">
          <p>
            You have selected <strong>{selectedCount}</strong> API{selectedCount !== 1 ? 's' : ''} for stress testing.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="iterations">Number of iterations per API:</label>
              <input
                type="number"
                id="iterations"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value) || 0)}
                min="1"
                max="1000"
                required
                disabled={isRunning}
              />
              <small>Each selected API will be called this many times (max 1000)</small>
            </div>
            
            <div className="test-summary">
              <p>
                <strong>Total requests:</strong> {selectedCount * iterations}
              </p>
              <p>
                <strong>Estimated duration:</strong> ~{Math.ceil((selectedCount * iterations * 0.5) / 60)} minutes
              </p>
            </div>
          </form>
        </div>
        
        <div className="dialog-footer">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isRunning}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="go-btn" 
            onClick={handleSubmit}
            disabled={iterations <= 0 || iterations > 1000 || isRunning}
          >
            {isRunning ? 'Running...' : 'Go'}
          </button>
        </div>
        
        {isRunning && (
          <div className="progress-indicator">
            <div className="spinner"></div>
            <p>Running stress test... Please wait.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StressTestDialog;