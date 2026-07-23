import React, { useState, useRef, useEffect } from "react";
import { Send, Square, Settings, X } from "lucide-react";
import { AppColors } from "../../../utils/AppColors";
import { useChat } from "../../../context/ChatContext";
import { chatService } from "../services/chatService";

export default function CommandInput() {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  const {
    addMessage,
    isGenerating,
    setIsGenerating,
    baseUrl,
    setBaseUrl,
    projectId,
    setProjectId,
  } = useChat();

  const [localBaseUrl, setLocalBaseUrl] = useState(baseUrl);

  useEffect(() => {
    setLocalBaseUrl(baseUrl);
  }, [baseUrl]);

  const handleInput = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200,
      )}px`;
    }
  };

  useEffect(() => {
    if (inputValue === "" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [inputValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    if (!baseUrl) {
      addMessage(
        "ai",
        "**System Error:** Please configure your Base URL in the settings first.",
      );
      return;
    }

    const userMessage = inputValue;
    addMessage("user", userMessage);
    setInputValue("");
    setIsGenerating(true);

    try {
      const result = await chatService.submitChat(projectId, userMessage);

      if (result.success) {
        if (result.data) {
          setProjectId(result.data.toString());
          localStorage.setItem("ai_project_id", result.data.toString());
        }
        addMessage("ai", result.message);
      } else {
        addMessage(
          "ai",
          `**Error:** ${result.message || "Request failed."} (Status: ${result.status})`,
        );
      }
    } catch (error) {
      console.error("API Call failed:", error);
      addMessage(
        "ai",
        "**System Error:** Failed to reach the server. Please check if your Base URL is correct and the server is running.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    setIsGenerating(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative group z-50">
      {/* ================= SETTINGS POPOVER ================= */}
      {showSettings && (
        <div
          className="absolute bottom-[70px] sm:bottom-[80px] left-0 right-0 sm:right-auto mx-auto sm:mx-0 w-[calc(100vw-2rem)] sm:w-80 p-4 rounded-2xl shadow-2xl transition-all duration-300 z-50"
          style={{
            backgroundColor: AppColors.background,
            border: `1px solid ${AppColors.borderHighlight}`,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-semibold tracking-wide"
              style={{ color: AppColors.textMain }}
            >
              Configuration
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X size={16} color={AppColors.textMuted} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label
                className="text-xs mb-1.5 block"
                style={{ color: AppColors.textMuted }}
              >
                Base URL
              </label>
              <input
                type="text"
                value={localBaseUrl}
                onChange={(e) => setLocalBaseUrl(e.target.value)}
                placeholder="e.g. http://localhost:8000"
                className="w-full bg-transparent p-2 text-sm rounded-lg outline-none transition-colors"
                style={{
                  color: AppColors.textMain,
                  border: `1px solid ${AppColors.border}`,
                  backgroundColor: AppColors.surface,
                }}
              />
            </div>

            <button
              onClick={() => {
                setBaseUrl(localBaseUrl);
                setShowSettings(false);
              }}
              className="w-full mt-2 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: AppColors.primary, color: "#fff" }}
            >
              Apply & Save
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN COMMAND INPUT ================= */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col justify-end transition-all duration-300 mx-2 sm:mx-0"
        style={{
          backgroundColor: AppColors.surface,
          borderRadius: "24px",
          border: `1px solid ${
            showSettings ? AppColors.primary : AppColors.borderHighlight
          }`,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="absolute left-2 sm:left-3 bottom-2.5 z-10">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            style={{
              backgroundColor: showSettings
                ? "rgba(255,255,255,0.1)"
                : "transparent",
            }}
            title="Configure Settings"
          >
            <Settings
              size={20}
              color={showSettings ? AppColors.textMain : AppColors.textMuted}
            />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInput}
          placeholder={isGenerating ? "AI is working..." : "Ask AI to build..."}
          disabled={isGenerating}
          className="w-full py-3 sm:py-4 pl-12 sm:pl-14 pr-14 sm:pr-16 bg-transparent outline-none resize-none text-sm transition-opacity custom-scrollbar"
          style={{
            color: AppColors.textMain,
            opacity: isGenerating ? 0.5 : 1,
            maxHeight: "200px",
            minHeight: "48px",
          }}
          rows="1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <div className="absolute right-2 sm:right-3 bottom-1.5 sm:bottom-2.5 z-10">
          {isGenerating ? (
            <button
              type="button"
              onClick={handleStop}
              className="p-2 sm:p-2.5 rounded-full flex items-center justify-center transition-all animate-pulse"
              style={{
                backgroundColor: AppColors.surface,
                border: `1px solid ${AppColors.borderHighlight}`,
              }}
              title="Stop Generation"
            >
              <Square
                size={16}
                fill={AppColors.textMuted}
                color={AppColors.textMuted}
              />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 sm:p-2.5 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: inputValue.trim()
                  ? AppColors.primary
                  : AppColors.surface,
                opacity: inputValue.trim() ? 1 : 0.5,
                cursor: inputValue.trim() ? "pointer" : "not-allowed",
              }}
            >
              <Send
                size={16}
                color={inputValue.trim() ? "#FFFFFF" : AppColors.textMuted}
                className="ml-0.5"
              />
            </button>
          )}
        </div>
      </form>

      <div className="text-center mt-2 px-4 sm:px-0">
        <span
          className="text-[9px] sm:text-[10px] tracking-wide block sm:inline"
          style={{ color: AppColors.textMuted }}
        >
          AI SDLC operates purely autonomously. Tokens will be deducted based on
          usage.
        </span>
      </div>
    </div>
  );
}
