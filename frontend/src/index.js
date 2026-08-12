import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { RefreshProvider } from './context/RefreshContext';
import { LanguageProvider } from './context/LanguageContext';

// Bạn có thể để tạm một chuỗi Client ID giả lập để giao diện hiển thị được trước
const GOOGLE_CLIENT_ID = "123456789-test.apps.googleusercontent.com";

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