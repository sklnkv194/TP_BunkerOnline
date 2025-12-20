import './App.css';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgetPasswordPage from './pages/ForgetPasswordPage';
import NewPasswordPage from './pages/NewPasswordPage';
import MainPage from './pages/MainPage';
import DeckPage from './pages/DeckPage';
import PersonalAccountPage from './pages/PersonalAccountPage';
import WaitGamePage from './pages/WaitGamePage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


function App() {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('id');
    return !!(token && user);
  };
  const isEmailForgetPassword = () => {
    const is_email_forget_password = localStorage.getItem('is_email_forget_password');
    return !!(is_email_forget_password);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated() ? 
            <Navigate to="/personal_account" replace /> :
            <LoginPage /> 
          } 
        />
        <Route 
          path="/register" 
          element={<RegisterPage />} 
        />
        <Route 
          path="/main" 
          element={<MainPage />} 
        />
        <Route 
          path="/forget_password" 
          element={
            <ForgetPasswordPage /> 
          } 
        />
        <Route 
          path="/new_password" 
          element={
            isEmailForgetPassword ? 
            <NewPasswordPage />  :
            <Navigate to="/" replace /> 
          
          } 
        />
        <Route 
          path="/personal_account" 
          element={
            isAuthenticated() ? 
            <PersonalAccountPage /> :
            <Navigate to="/" replace /> 
            
          } 
        />
        <Route 
          path="/deck/:deck_id"
          element={
            isAuthenticated() ? 
            <DeckPage /> :
            <Navigate to="/" replace /> 
            
          } 
        />
        <Route 
          path="/wait_for_game/:gameId" 
          element={<WaitGamePage />} 
        />
      </Routes>
    </Router>
  );
}

export default App;