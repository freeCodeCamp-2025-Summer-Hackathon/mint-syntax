import { StrictMode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HelmetProvider } from 'react-helmet-async';

const router = createBrowserRouter([
  {
    path: '*',
    element: <App />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>
);
