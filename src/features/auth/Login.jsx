// src/features/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInputRaw from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const PhoneInput = PhoneInputRaw.default || PhoneInputRaw;
import { GoogleLogin } from "@react-oauth/google";
import { Bot, Eye, EyeOff, Lock } from "lucide-react";
import { authService } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState("otp"); // 'otp' | 'password'

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handlePhoneChange = (value) => {
    setPhone(value || "");
    const digitCount = (value || "").replace(/\D/g, "").length;
    setIsValid(digitCount >= 10 && digitCount <= 15);
  };

  const extractPhoneMeta = () => {
    const digitsOnly = phone.replace(/\D/g, "");
    let dynamicCountryCode = "91";
    let cleanMobileNumber = digitsOnly;

    if (digitsOnly.length > 10) {
      dynamicCountryCode = digitsOnly.slice(0, digitsOnly.length - 10);
      cleanMobileNumber = digitsOnly.slice(-10);
    }
    return { cleanMobileNumber, dynamicCountryCode };
  };

  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isValid || isAuthenticating) return;

    const { cleanMobileNumber, dynamicCountryCode } = extractPhoneMeta();
    setIsAuthenticating(true);

    try {
      if (loginMode === "otp") {
        const res = await authService.sendOtp(
          cleanMobileNumber,
          dynamicCountryCode,
        );
        if (res) {
          navigate("/otp-verify", {
            state: {
              phoneNumber: cleanMobileNumber,
              countryCode: dynamicCountryCode,
            },
          });
        }
      } else {
        if (!password) {
          alert("Please provide account password mapping.");
          setIsAuthenticating(false);
          return;
        }
        const res = await authService.loginWithPassword(
          cleanMobileNumber,
          password,
          dynamicCountryCode,
        );
        if (res && res.token) {
          localStorage.setItem("admin_token", res.token);
          localStorage.setItem("user_role", res.rolename || "InternalAdmin");
          navigate("/");
        }
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Authentication routing failure.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await authService.verifyGoogleLogin(
        credentialResponse?.credential,
      );
      if (res && res.token) {
        localStorage.setItem("admin_token", res.token);
        localStorage.setItem("user_role", res.rolename || "InternalAdmin");
        navigate("/");
      }
    } catch (error) {
      alert("Could not communicate with the authentication servers.");
    }
  };

  const isButtonEnabled =
    loginMode === "otp"
      ? isValid && !isAuthenticating
      : isValid && password && !isAuthenticating;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--backgroundColor)] p-[var(--containerPadding,16px)] font-[var(--fontFamilyBase,Roboto)]">
      <div className="w-full max-w-[480px] bg-[var(--cardBg)] text-[var(--cardTextColor)] p-8 rounded-[var(--cardBorderRadius,18px)] border border-[var(--borderColor)] shadow-[var(--cardShadow)]">
        {/* Logo Identity Frame */}
        <div className="flex flex-col justify-center items-center mb-6">
          <div className="flex items-center gap-2 text-[var(--secondaryColor)] font-[var(--fontWeightBold,600)] text-[var(--fontSizeXl,22px)] font-[var(--fontFamilyHeading,Roboto)]">
            <span className="text-3xl">
              <Bot />
            </span>
            <span className="tracking-tight  text-textMain">AI SDLC</span>
          </div>
        </div>

        <h1 className="text-center text-[var(--textColor)] text-[var(--fontSizeXl,22px)] font-[var(--fontWeightBold,600)] font-[var(--fontFamilyHeading,Roboto)] mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-[var(--textSecondaryColor)] text-[var(--fontSizeSm,14px)] mb-6">
          Access your administrative portal panel space securely.
        </p>

        {/* Tab Navigation Controls */}
        <div className="flex bg-[var(--backgroundColor)] p-1 rounded-xl mb-6 border border-[var(--tableBorderColor)]">
          <button
            type="button"
            onClick={() => setLoginMode("password")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              loginMode === "password"
                ? "bg-[var(--cardBg)] text-primary shadow-xs"
                : "text-[var(--textSecondaryColor)]"
            }`}
          >
            Password Sign-In
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("otp")}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
              loginMode === "otp"
                ? "bg-[var(--cardBg)] text-primary shadow-xs"
                : "text-[var(--textSecondaryColor)]"
            }`}
          >
            Verify via OTP
          </button>
        </div>

        {/* Google Single Sign-On Hook */}
        <div className="flex justify-center w-full mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Sign-In Cancelled")}
            theme="outline"
            shape="rectangular"
            width="340"
          />
        </div>

        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-[var(--tableBorderColor)]" />
          <span className="px-4 text-[var(--textSecondaryColor)] text-[var(--fontSizeXs,12px)] tracking-widest">
            OR
          </span>
          <div className="flex-1 h-px bg-[var(--tableBorderColor)]" />
        </div>

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
          <div className="w-full text-left">
            <label
              htmlFor="admin-phone-login"
              className="block mb-2 text-[var(--textColor)] text-[var(--fontSizeSm,14px)] font-[var(--fontWeightSemibold,500)]"
            >
              Mobile Number
            </label>
            <PhoneInput
              country="in"
              value={phone}
              onChange={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              countryCodeEditable={false}
              inputProps={{
                id: "admin-phone-login",
                name: "phone",
                autoComplete: "tel",
              }}
              containerClass="!w-full !relative"
              inputClass={`!w-full !h-[52px] !pl-[56px] !rounded-[var(--inputBorderRadius,12px)] !bg-[var(--inputBg)] !text-[var(--inputText)] text-base transition-all ${
                isFocused
                  ? "!border-[1.5px] !border-[var(--inputBorderActive)]"
                  : "!border !border-[var(--inputBorderColor)]"
              }`}
              buttonClass={`!h-[52px] !bg-[var(--inputBg)] !rounded-l-[var(--inputBorderRadius,12px)] ${
                isFocused
                  ? "!border-[1.5px] !border-[var(--inputBorderActive)]"
                  : "!border !border-[var(--inputBorderColor)]"
              }`}
            />
          </div>

          {loginMode === "password" && (
            <div className="w-full text-left">
              <label
                htmlFor="admin-password-login"
                className="block mb-2 text-[var(--textColor)] text-[var(--fontSizeSm,14px)] font-[var(--fontWeightSemibold,500)]"
              >
                Account Password
              </label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-gray-400" />
                <input
                  id="admin-password-login"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="w-full h-[52px] pl-12 pr-12 rounded-[var(--inputBorderRadius,12px)] outline-hidden border transition-all text-sm font-medium"
                  style={{
                    backgroundColor: "var(--inputBg)",
                    color: "var(--inputText)",
                    borderColor: isPasswordFocused
                      ? "var(--inputBorderActive)"
                      : "var(--inputBorderColor)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isButtonEnabled}
            className="w-full flex items-center justify-center h-[52px] mt-2 transition-all active:scale-[0.99]"
            style={{
              borderRadius: "var(--buttonBorderRadius, 24px)",
              fontSize: "var(--fontSizeBase, 16px)",
              fontWeight: "var(--fontWeightBold, 600)",
              backgroundColor: isButtonEnabled
                ? "var(--buttonBg)"
                : "var(--tableBorderColor)",
              color: isButtonEnabled
                ? "var(--buttonText)"
                : "var(--textSecondaryColor)",
              boxShadow: isButtonEnabled ? "var(--buttonShadow)" : "none",
              cursor: isButtonEnabled ? "pointer" : "not-allowed",
            }}
          >
            {isAuthenticating ? (
              <div
                className="animate-spin rounded-full w-5 h-5 border-2 border-t-transparent"
                style={{ borderColor: "var(--buttonText)" }}
              />
            ) : (
              <span>
                {loginMode === "otp"
                  ? "Continue with Phone OTP"
                  : "Login with Account Credentials"}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
