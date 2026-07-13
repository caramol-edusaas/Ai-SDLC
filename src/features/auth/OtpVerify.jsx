// src/features/auth/OtpVerify.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { Lock } from "lucide-react";

export default function OtpVerify() {
  const location = useLocation();
  const navigate = useNavigate();

  const phoneNumber = location.state?.phoneNumber || "";
  const countryCode = location.state?.countryCode || "91";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!phoneNumber) {
      alert("Invalid context redirecting to sign-in.");
      navigate("/login");
    }
  }, [phoneNumber, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (currentOtpArray = otp) => {
    const combinedOtp = currentOtpArray.join("");
    if (combinedOtp.length !== 4) return;

    setIsVerifying(true);
    try {
      const res = await authService.verifyOtp(
        phoneNumber,
        combinedOtp,
        countryCode,
      );
      if (res && res.token) {
        localStorage.setItem("admin_token", res.token);
        localStorage.setItem("user_role", res.rolename || "InternalAdmin");
        navigate("/");
      } else {
        alert(res?.message || "Token authorization rejected.");
      }
    } catch (err) {
      alert("Invalid Code Token verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (otp.every((val) => val !== "")) {
      handleVerify(otp);
    }
  }, [otp]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authService.sendOtp(phoneNumber, countryCode);
      setOtp(["", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      alert("Failed to send OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--backgroundColor)] font-[var(--fontFamilyBase)]">
      <div className="w-full max-w-[460px] p-8 text-center bg-[var(--cardBg)] text-[var(--cardTextColor)] rounded-[var(--cardBorderRadius)] border border-[var(--borderColor)] shadow-[var(--cardShadow)]">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 bg-[var(--buttonBg)] text-[var(--buttonText)]">
          <Lock size={26} />
        </div>

        <h1 className="mb-2 text-[var(--textColor)] text-[var(--fontSizeXl)] font-[var(--fontWeightBold)]">
          Verify Your Code
        </h1>
        <p className="mb-6 text-[var(--textSecondaryColor)] text-[var(--fontSizeSm)]">
          A security PIN was dispatched to <br />
          <span className="font-bold text-[var(--textColor)]">
            +{countryCode} {phoneNumber}
          </span>
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-lg font-bold outline-hidden transition-all duration-200"
              style={{
                backgroundColor: "var(--inputBg)",
                color: "var(--inputText)",
                borderRadius: "var(--inputBorderRadius)",
                border: "1px solid var(--inputBorderColor)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--inputBorderActive)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--inputBorderColor)")
              }
            />
          ))}
        </div>

        <button
          onClick={() => handleVerify()}
          disabled={isVerifying || otp.some((val) => val === "")}
          className="w-full h-[50px] flex items-center justify-center transition-all duration-200 font-[var(--fontWeightBold)] disabled:opacity-50"
          style={{
            backgroundColor: "var(--buttonBg)",
            color: "var(--buttonText)",
            borderRadius: "var(--buttonBorderRadius)",
            boxShadow: "var(--buttonShadow)",
          }}
        >
          {isVerifying ? (
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--buttonText)" }}
            />
          ) : (
            "Verify Code"
          )}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--textSecondaryColor)]">
          <span>Didn't receive OTP?</span>
          {isResending ? (
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-primary" />
          ) : (
            <button
              onClick={handleResend}
              className="bg-transparent border-none cursor-pointer text-primary font-bold"
            >
              Resend
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
