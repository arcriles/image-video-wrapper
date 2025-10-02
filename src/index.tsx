import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ApiKeyGate from './components/ApiKeyGate';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ApiKeyGate />
  </React.StrictMode>
);