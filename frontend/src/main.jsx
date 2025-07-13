import { StrictMode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import App from './App.jsx';
import { UserProvider } from './user/UserProvider.jsx';

const router = createBrowserRouter([
  {
    path: '*',
    element: <App />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </UserProvider>
  </StrictMode>
);
