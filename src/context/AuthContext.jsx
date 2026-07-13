// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("rolename");

    if (savedToken) {
      setIsAuthenticated(true);
      setUser({
        rolename: savedRole || "InternalAdmin",
        // Creating placeholder details since the token contains the identity payload
        name: "Admin User",
        tier: "Paid Plan",
      });
    }
    setLoading(false);
  }, []);

  // Shared routine to manage the exact API response you provided
  const handleAuthSuccess = (data) => {
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("rolename", data.rolename);

      setToken(data.token);
      setIsAuthenticated(true);
      setUser({
        rolename: data.rolename,
        name: data.rolename === "InternalAdmin" ? "Admin Staff" : "User",
        tier: "Paid Plan", // Default tier styling configuration indicator
      });
      return true;
    }
    return false;
  };

  // 1. Password Authentication Call
  const loginWithPassword = async (credentials) => {
    try {
      setLoading(true);
      const data = await authService.loginWithPassword(credentials);
      handleAuthSuccess(data);
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // 2. Request OTP Call
  const sendOtp = async (mobileNo) => {
    try {
      await authService.requestOtp(mobileNo);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send OTP",
      };
    }
  };

  // 3. Verify OTP Call
  const verifyOtp = async (otpData) => {
    try {
      setLoading(true);
      const data = await authService.verifyOtp(otpData);
      handleAuthSuccess(data);
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Invalid OTP",
      };
    } finally {
      setLoading(false);
    }
  };

  // 4. Google Sign-In Call
  const loginWithGoogle = async (credentialToken) => {
    try {
      setLoading(true);
      const data = await authService.loginWithGoogle(credentialToken);
      handleAuthSuccess(data);
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Google Auth failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rolename");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        loginWithPassword,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
