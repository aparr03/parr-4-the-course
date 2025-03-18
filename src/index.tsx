import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Define router first before using it
const router = createBrowserRouter(
  [
    {
      path: '*',
      element: <App />,
    },
    // Add other routes here
  ]
);

// Optimize browser rendering
const root = document.getElementById('root') as HTMLElement;
if (root.hasChildNodes()) {
  // Use hydration for faster initial render if SSR is enabled later
  ReactDOM.hydrateRoot(
    root,
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
} else {
  // Normal client-side rendering
  ReactDOM.createRoot(root).render(
    // Only use StrictMode in development
    import.meta.env.DEV ? (
      <React.StrictMode>
        <ThemeProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ThemeProvider>
      </React.StrictMode>
    ) : (
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    )
  );
}
