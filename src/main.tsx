/**
 * SentinelScan Application Entry Point
 * Path: src/main.tsx
 *
 * Main entry point for the React application.
 * Initializes React 19 with createRoot, wraps with Redux Provider and BrowserRouter.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { store } from './store';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);