// src/utils/logger.jsx
import React from 'react';

// This 'import.meta.env.DEV' variable is automatically set by Vite
// to 'true' when running in development mode (e.g., 'npm run dev').
// It's 'false' when built for production.
export function devLog(message, ...optionalParams) {
  if (import.meta.env.DEV) {
    console.log('[DEV LOG]', message, ...optionalParams);
  }
}

export function DevOnly({ children }) {
  if (import.meta.env.DEV) {
    return <>{children}</>;
  }
  return null;
}
