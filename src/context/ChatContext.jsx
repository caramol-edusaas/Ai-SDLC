import React, { createContext, useContext, useState, useEffect } from "react";
import { chatService } from "../features/chat/services/chatService";
import { billingService } from "../features/chat/services/billingService";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // --- EXISTING STATES ---
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [baseUrl, setBaseUrl] = useState(
    localStorage.getItem("ai_base_url") || "",
  );
  const [projectId, setProjectId] = useState(
    localStorage.getItem("ai_project_id") || null,
  );

  // --- NEW STATES FOR SIDEBAR & WALLET ---
  const [projects, setProjects] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  // Tumhare JSON response ke according userId abhi main 122222222222 le raha hu.
  // Baad me isko login wale Auth context ya localStorage ("user_id") se utha lena.
  const userId = localStorage.getItem("user_id") || "122222222222";

  // Sync Base URL & Project ID to LocalStorage
  useEffect(() => {
    if (baseUrl) localStorage.setItem("ai_base_url", baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    if (projectId) localStorage.setItem("ai_project_id", projectId);
  }, [projectId]);

  // --- NEW FUNCTIONS ---

  // 1. Fetch All Projects
  const fetchProjects = async () => {
    if (!baseUrl) return; // Bina Base URL ke fetch mat karo
    try {
      const result = await chatService.loadProjects();
      if (result.success) {
        setProjects(result.data); // Array of projects (id, title, etc.)
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  // 2. Fetch Wallet Balance
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

  // 3. Add Money to Wallet
  const addMoney = async (amount) => {
    try {
      const result = await billingService.addMoneyToWallet(userId, amount);
      if (result.success) {
        await fetchWalletBalance(); // Recharge ke baad turant balance refresh karo!
        return { success: true, message: result.message };
      }
      return { success: false, message: "Recharge failed" };
    } catch (error) {
      console.error("Error adding money:", error);
      return { success: false, message: "Server error" };
    }
  };

  // Jab bhi app load ho ya Base URL change ho, Data Fetch kar lo
  useEffect(() => {
    if (baseUrl) {
      fetchProjects();
      fetchWalletBalance();
    }
  }, [baseUrl]);

  // Utility to add messages manually
  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        addMessage,
        isGenerating,
        setIsGenerating,
        baseUrl,
        setBaseUrl,
        projectId,
        setProjectId,
        // --- EXPORTING NEW VARIABLES & FUNCTIONS ---
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
