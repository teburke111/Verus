import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from './reportWebVitals';
// ADD: Import the AuthProvider
import { AuthProvider } from './AuthContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Use React.StrictMode for cleaner development checks
  <React.StrictMode>
    <BrowserRouter>
      {/* ADD: Wrap App with AuthProvider */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
