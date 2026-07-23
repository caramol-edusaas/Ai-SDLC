import React, { useState } from "react";
import { useChat } from "../../../context/ChatContext";
import { chatService } from "../services/chatService";
import {
  Wallet,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  SquarePen,
  User,
  MoreHorizontal,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { AppColors } from "../../../utils/AppColors";
import BillingModal from "./BillingModal";

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const {
    projects,
    walletBalance,
    addMoney,
    projectId,
    setProjectId,
    setMessages,
    setIsGenerating,
    fetchWalletBalance,
  } = useChat();

  const [isRecharging, setIsRecharging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isWalletRevealed, setIsWalletRevealed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userName = localStorage.getItem("user_name") || "Admin User";
  const userRole = localStorage.getItem("user_role") || "Premium Plan";
  const userId = localStorage.getItem("user_id") || 1;

  const handleNewChat = () => {
    setProjectId(null);
    setMessages([]);
    localStorage.removeItem("ai_project_id");
    if (window.innerWidth < 768) setIsMobileOpen(false);
  };

  const handleWalletToggle = async () => {
    const willReveal = !isWalletRevealed;
    setIsWalletRevealed(willReveal);

    // Only fetch fresh data from the API if we are opening the eye icon
    if (willReveal) {
      await fetchWalletBalance();
    }
  };

  const handleProjectClick = async (selectedId) => {
    const newIdString = selectedId.toString();
    if (projectId === newIdString) return;

    setProjectId(newIdString);
    setIsGenerating(true);
    setMessages([]);

    if (window.innerWidth < 768) setIsMobileOpen(false);

    try {
      const result = await chatService.getConversations(selectedId);

      if (result.success && result.data && result.data.length > 0) {
        const historyChats = result.data[0].chats.map((chat) => ({
          role: chat.from === "USER" ? "user" : "ai",
          content: chat.message,
        }));
        setMessages(historyChats);
      } else {
        setMessages([
          {
            role: "ai",
            content: "Hello! How can I assist you with this project today?",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      setMessages([
        {
          role: "ai",
          content: "**Error:** Could not load previous conversations.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecharge = async (e) => {
    e.stopPropagation();
    const amountStr = window.prompt(
      "Enter amount to recharge (e.g., 500):",
      "500",
    );
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsRecharging(true);
    const result = await addMoney(amount);
    setIsRecharging(false);

    if (result.success) {
      alert(`Success: ${result.message}`);
    } else {
      alert(`Failed: ${result.message}`);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-in-out border-r w-64 transform ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      style={{
        backgroundColor: AppColors.background,
        borderColor: AppColors.border,
      }}
    >
      {/* ================= HEADER: TOGGLE & NEW CHAT ================= */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:block p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="Toggle Sidebar"
        >
          {isCollapsed ? (
            <PanelLeft size={20} color={AppColors.textMuted} />
          ) : (
            <PanelLeftClose size={20} color={AppColors.textMuted} />
          )}
        </button>

        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="Close Sidebar"
        >
          <X size={20} color={AppColors.textMuted} />
        </button>

        {!isCollapsed && (
          <button
            onClick={handleNewChat}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
            title="Start New Chat"
          >
            <SquarePen size={18} color={AppColors.textMain} />
          </button>
        )}
      </div>

      {/* ================= WALLET FLIP CARD ================= */}
      <div className="px-4 mb-4">
        <div
          onClick={handleWalletToggle}
          className="cursor-pointer rounded-xl p-4 shadow-lg transition-all duration-500 flex flex-col justify-center relative overflow-hidden group"
          style={{
            backgroundColor: AppColors.surface,
            border: `1px solid ${AppColors.borderHighlight}`,
            minHeight: isCollapsed ? "60px" : "80px",
            transformStyle: "preserve-3d",
          }}
          title="Click to reveal balance"
        >
          {isCollapsed ? (
            <div className="mx-auto hidden md:block">
              <Wallet size={20} color={AppColors.primary} />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] uppercase font-bold tracking-widest"
                    style={{ color: AppColors.textMuted }}
                  >
                    Wallet
                  </span>
                  {isWalletRevealed ? (
                    <EyeOff size={12} color={AppColors.textMuted} />
                  ) : (
                    <Eye size={12} color={AppColors.textMuted} />
                  )}
                </div>

                <span
                  className="text-xl font-extrabold flex items-center gap-1 transition-all"
                  style={{ color: AppColors.textMain }}
                >
                  ₹{isWalletRevealed ? walletBalance.toFixed(2) : "****"}
                </span>
              </div>

              <button
                onClick={handleRecharge}
                disabled={isRecharging}
                className="p-2 rounded-full hover:scale-105 transition-all shadow-md z-10"
                style={{ backgroundColor: AppColors.primary, color: "#fff" }}
                title="Add Money"
              >
                <Plus
                  size={16}
                  className={isRecharging ? "animate-spin" : ""}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <hr className="mx-4 mb-4" style={{ borderColor: AppColors.border }} />

      {/* ================= PROJECT LIST SECTION ================= */}
      {(!isCollapsed || window.innerWidth < 768) && (
        <h3
          className="text-[10px] font-bold uppercase tracking-widest mb-3 px-6"
          style={{ color: AppColors.textMuted }}
        >
          Your Projects
        </h3>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 flex flex-col gap-1">
        {projects.length === 0 && (!isCollapsed || window.innerWidth < 768) ? (
          <div
            className="text-xs text-center mt-6 italic opacity-50"
            style={{ color: AppColors.textMuted }}
          >
            No projects found.
            <br />
            Start a new chat!
          </div>
        ) : (
          projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => handleProjectClick(proj.id)}
              className={`text-left p-3 rounded-xl flex items-center transition-all duration-200 ${
                isCollapsed ? "md:justify-center" : "gap-3"
              }`}
              style={{
                backgroundColor:
                  projectId === proj.id.toString()
                    ? "rgba(255,255,255,0.05)"
                    : "transparent",
                border: `1px solid ${
                  projectId === proj.id.toString()
                    ? AppColors.borderHighlight
                    : "transparent"
                }`,
              }}
              title={proj.title}
            >
              <MessageSquare
                size={16}
                className="min-w-[16px]"
                color={
                  projectId === proj.id.toString()
                    ? AppColors.primary
                    : AppColors.textMuted
                }
              />

              {(!isCollapsed || window.innerWidth < 768) && (
                <div className="flex flex-col overflow-hidden w-full">
                  <span
                    className="text-sm font-medium truncate w-full"
                    style={{ color: AppColors.textMain }}
                  >
                    {proj.title}
                  </span>
                </div>
              )}
            </button>
          ))
        )}
      </div>

      <div className="px-4 py-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`w-full text-xs font-semibold py-2 rounded-lg transition-colors hover:bg-white/5 ${
            isCollapsed ? "md:hidden" : ""
          }`}
          style={{
            color: AppColors.textMuted,
            border: `1px solid ${AppColors.border}`,
          }}
        >
          Show Usage Analytics
        </button>
      </div>

      {/* ================= USER PROFILE (FOOTER) ================= */}
      <div
        className="mt-auto p-4 border-t"
        style={{ borderColor: AppColors.border }}
      >
        <button
          className={`w-full flex items-center rounded-xl transition-colors hover:bg-white/5 p-2 ${
            isCollapsed ? "md:justify-center" : "gap-3"
          }`}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: AppColors.primary }}
          >
            <User size={16} color="#fff" />
          </div>

          {(!isCollapsed || window.innerWidth < 768) && (
            <>
              <div className="flex flex-col flex-1 text-left overflow-hidden">
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: AppColors.textMain }}
                >
                  {userName}
                </span>
                <span
                  className="text-[10px] truncate"
                  style={{ color: AppColors.textMuted }}
                >
                  {userRole}
                </span>
              </div>
              <MoreHorizontal size={16} color={AppColors.textMuted} />
            </>
          )}
        </button>
      </div>

      <BillingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        projectId={projectId}
      />
    </div>
  );
}
