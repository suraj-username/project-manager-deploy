import React from 'react';

function LoginPage() {
  const handleLogin = () => {
    // --- DEPLOYMENT FIX ---
    // If we are in production, we need the full backend URL.
    // If we are in dev, relative path '/api/...' is fine via proxy.
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
    
    // Redirect the browser to the backend
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="login-container">
      <h1>Project Manager</h1>
      <p>Please log in to continue</p>
      <button onClick={handleLogin} className="login-button">
        Login with Google
      </button>
    </div>
  );
}

export default LoginPage;