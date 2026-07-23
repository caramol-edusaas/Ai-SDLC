// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./features/auth/Login";
import OtpVerify from "./features/auth/OtpVerify";
import DashboardPage from "./features/chat/DashboardPage";
import { ChatProvider } from "./context/ChatContext";

// Protected Route Shield
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/otp-verify" element={<OtpVerify />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatProvider>
              <DashboardPage />
            </ChatProvider>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const googleClientId =
    "536749711566-rg8mobp3nigbfkp151ufm5ga4554iopo.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
