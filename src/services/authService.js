// src/services/authService.js
import apiClient from "./apiClient";

const getAppCode = () => {
  return (
    localStorage.getItem("app_code") ||
    import.meta.env.VITE_APP_CODE ||
    "CoachingPlusApp"
  );
};

export const authService = {
  /**
   * 1. Login via Password
   * Route: /auth/login/password/1
   */
  loginWithPassword: async (mobileNo, password, countryCode = "91") => {
    const response = await apiClient.post("/auth/login/password/1", null, {
      params: {
        mobileNo,
        appcode: getAppCode(),
        countrycode: countryCode,
        password,
      },
    });
    return response.data;
  },

  /**
   * 2. Trigger Outbound OTP Verification Code
   * Route: /auth/getotp/{mobileNo}
   */
  sendOtp: async (mobileNo, countryCode = "91") => {
    const response = await apiClient.post(`/auth/getotp/${mobileNo}`, null, {
      params: {
        appcode: getAppCode(),
        countrycode: countryCode,
      },
    });
    return response.data;
  },

  /**
   * 3. Complete Secure OTP Token Handshake
   * Route: /auth/verifyotp/1
   */
  verifyOtp: async (mobileNo, otp, countryCode = "91") => {
    const response = await apiClient.post("/auth/verifyotp/1", null, {
      params: {
        mobileNo: mobileNo,
        otp: 3456,
        appcode: getAppCode(),
        countrycode: countryCode,
      },
    });
    return response.data;
  },

  /**
   * 4. Authenticate Handshake with Google OAuth Sign-in
   * Route: /auth/google/1
   */
  verifyGoogleLogin: async (idToken) => {
    const timeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Calcutta";
    const payload = {
      str1: getAppCode(),
      str2: idToken,
      str3: timeZone,
    };
    const response = await apiClient.post("/auth/google/1", payload);
    return response.data;
  },

  getSelfProfile: async (tokenOverride) => {
    // Agar login se naya token mila hai toh wo use karo, warna local storage se uthao
    const token = tokenOverride || localStorage.getItem("admin_token");

    const response = await apiClient.get("/user/self/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
