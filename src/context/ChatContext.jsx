// src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { chatService } from "../features/chat/services/chatService";
import { billingService } from "../features/chat/services/billingService";
import { wsService } from "../services/websocketService";
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [workflowState, setWorkflowState] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [baseUrl, setBaseUrl] = useState(
    localStorage.getItem("ai_base_url") || "",
  );
  const [projectId, setProjectId] = useState(
    localStorage.getItem("ai_project_id") || null,
  );

  const [projects, setProjects] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const userId = localStorage.getItem("user_id") || "122222222222";

  // Sync Base URL & Project ID to LocalStorage
  useEffect(() => {
    if (baseUrl) localStorage.setItem("ai_base_url", baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    if (projectId) localStorage.setItem("ai_project_id", projectId);
  }, [projectId]);

  // Utility to add messages manually
  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { id: Date.now(), role, content }]);
  };

  const handleWebSocketMessage = (data) => {
    console.log("WebSocket Raw Data Received:", data);

    // 1. ERROR MAPPING
    if (data.success === false && data.status === 401) {
      addMessage(
        "ai",
        `**🚨 Error ${data.status}:** ${data.message} (${data.error})`,
      );
      setIsGenerating(false);
      return;
    }

    // 2. SUCCESS MAPPING
    if (data.mode) {
      const replyText = data.assistantReply || data.message;

      if (replyText) {
        addMessage("ai", replyText);
      }

      // Update Workflow State
      if (data.mode === "REQUIREMENT_WORKFLOW") {
        setWorkflowState({
          taskState: data.taskState,
          pendingQuestion: data.pendingQuestion,
          nextAction: data.nextAction,
        });
      }

      setIsGenerating(false);
    }
  };

  // Connect WebSocket on Load
  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (baseUrl && token && userId) {
      wsService.connect(baseUrl, token, userId, handleWebSocketMessage);
    }

    return () => {
      wsService.disconnect();
    };
  }, [baseUrl, userId]);

  const fetchProjects = async () => {
    if (!baseUrl) return;
    try {
      const result = await chatService.loadProjects();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const fetchWalletBalance = async () => {
    if (!baseUrl) return;
    try {
      const result = await billingService.getWalletBalance(userId);
      if (result.success && result.data) {
        setWalletBalance(result.data.availableBalance);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const addMoney = async (amount) => {
    try {
      const result = await billingService.addMoneyToWallet(userId, amount);
      if (result.success) {
        await fetchWalletBalance();
        return { success: true, message: result.message };
      }
      return { success: false, message: "Recharge failed" };
    } catch (error) {
      console.error("Error adding money:", error);
      return { success: false, message: "Server error" };
    }
  };

  useEffect(() => {
    if (baseUrl) {
      fetchProjects();
      fetchWalletBalance();
    }
  }, [baseUrl]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        addMessage,
        workflowState, // Exporting so ChatCanvas can read it
        isGenerating,
        setIsGenerating,
        baseUrl,
        setBaseUrl,
        projectId,
        setProjectId,
        projects,
        walletBalance,
        fetchWalletBalance,
        addMoney,
        fetchProjects,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
