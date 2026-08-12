import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { RefreshProvider } from './context/RefreshContext';
import { LanguageProvider } from './context/LanguageContext';

// Google Client ID chính thức (Hỗ trợ đọc từ biến môi trường REACT_APP_GOOGLE_CLIENT_ID)
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "610134536543-iepm19bs8du5kjjel17ujssfl3guv3j8.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <RefreshProvider>
          <App />
        </RefreshProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);