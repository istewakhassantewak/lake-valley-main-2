import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { ImageProvider } from './context/ImageContext.jsx';
import { ContentProvider } from './context/ContentContext.jsx';
import ErrorBoundary from './components/Shared/ErrorBoundary.jsx';
import './index.css';
import router from './Routes/Routes.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <ContentProvider>
                <ImageProvider>
                  <RouterProvider router={router} />
                </ImageProvider>
              </ContentProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);

