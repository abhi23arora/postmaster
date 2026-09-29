import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { HistoryProvider } from './HistoryContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<HistoryProvider><App /></HistoryProvider>);
}