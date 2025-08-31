import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      // For demo purposes, create a default user
      const defaultUser = {
        id: 1,
        username: 'demo',
        email: 'demo@example.com'
      };
      setUser(defaultUser);
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', userData);
      setUser(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', userData);
      setUser(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};