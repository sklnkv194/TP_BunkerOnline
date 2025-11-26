import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/btn.css';
import './styles/input.css';
import './styles/form.css';
import './styles/main.css';
import './styles/card.css'
import './styles/font.css'
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
