import React, { useState, useEffect } from "react";
import UserProfile from "./components/UserProfile";
import Login from "./components/Login";
import SensitiveDataTimer from "./components/SensitiveDataTimer";
import { SensitiveDataProvider } from "./context/SensitiveDataContext";
import { apiService } from "./services/api";
import "./styles/App.css";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          await apiService.getCurrentUser();
          setIsAuthenticated(true);
        } catch {
          apiService.logout();
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <SensitiveDataProvider>
      <div className="container">
        <header className="header">
          <h1>My Account</h1>
          <p>Manage your account information and preferences</p>
          <button
            className="btn btn-secondary logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <SensitiveDataTimer />

        <UserProfile />
      </div>
    </SensitiveDataProvider>
  );
};

export default App;
