import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { API_BASE } from './config';

import './styles/App.css'; // Import your global styles here
import './styles/AdminPage.css';
import './styles/UserPage.css';
import './styles/WorkoutBoard.css';
import './styles/Login.css';
import './styles/AdminUserManager.css';
import './styles/SessionList.css';
import './styles/WorkoutBoard.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to enable service worker for offline capabilities, uncomment the next line
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
