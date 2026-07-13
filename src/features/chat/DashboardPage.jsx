// src/features/chat/DashboardPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Plus,
  MessageSquare,
  Settings,
  Send,
  LogOut,
  ChevronLeft,
  User,
  Bot,
  Link2,
  Unlink,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default false for mobile

  // Chat States
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! Enter your Webhook/WebSocket endpoint above to connect.",
    },
  ]);

  // Connection States
  const [baseEndpoint, setBaseEndpoint] = useState("ws://localhost:8080");
  const [projectId, setProjectId] = useState("");
  const [userId, setUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket Ref to hold the instance
  const wsRef = useRef(null);

  const userRole = localStorage.getItem("user_role") || "InternalAdmin";

  // Fetch User ID on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // MOCKING YOUR API CLIENT HERE
        // const response = await apiClient.get("/user/self/profile");
        const mockResponse = {
          success: true,
          data: { long1: 4872281817874432 }, // Using your provided structure
        };

        if (mockResponse.success) {
          setUserId(mockResponse.data.long1);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

    fetchProfile();
  }, []);

  const handleConnect = () => {
    if (!baseEndpoint || !projectId || !userId) {
      alert("Please ensure Endpoint, Project ID, and User ID are available.");
      return;
    }

    // Disconnect existing if any
    if (wsRef.current) wsRef.current.close();

    // Constructing the final URL: {endpoint}/{userId}/{projectId}
    // Note: Ensuring no double slashes if user adds a trailing slash
    const cleanEndpoint = baseEndpoint.replace(/\/$/, "");
    const wsUrl = `${cleanEndpoint}/${userId}/${projectId}`;

    console.log("Attempting to connect to:", wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Connected to Webhook/WebSocket!");
        setIsConnected(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `Successfully connected to project ${projectId}!`,
          },
        ]);
      };

      ws.onmessage = (event) => {
        console.log("Message from server:", event.data);
        // Assuming server sends plain text, if JSON, you need JSON.parse(event.data)
        setMessages((prev) => [...prev, { role: "ai", text: event.data }]);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Connection error occurred. Check console." },
        ]);
      };

      ws.onclose = () => {
        console.log("WebSocket Disconnected");
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Failed to create WebSocket", err);
      alert("Invalid Webhook URL format. Usually starts with ws:// or wss://");
    }
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const handleLogout = () => {
    handleDisconnect();
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages([...messages, { role: "user", text: inputValue }]);

    // Send to WebSocket if connected
    if (wsRef.current && isConnected) {
      wsRef.current.send(inputValue);
    } else {
      // Offline fallback text for testing UI
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "You are offline. Please connect to the webhook first.",
        },
      ]);
    }

    setInputValue("");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } w-[260px] transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200 bg-white z-30 shrink-0`}
      >
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={() => setMessages([])}
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-800 font-medium text-sm"
          >
            <Plus size={18} className="text-blue-600" />
            New Test Chat
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden ml-2 p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col items-center justify-center text-gray-400 text-sm text-center px-4">
          <MessageSquare size={32} className="mb-2 opacity-50" />
          <p>No dummy data. Real sessions will appear here later.</p>
        </div>

        <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
          <div className="mt-2 flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                <User size={16} />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-gray-800 truncate">
                  Admin Session
                </span>
                <span className="text-xs text-blue-600 font-medium capitalize">
                  {userRole} | ID: {userId || "Loading..."}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-white text-gray-500 hover:text-red-500 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CHAT CANVAS ================= */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-gray-50">
        {/* Top Navigation Bar & Webhook Settings */}
        <header className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 gap-3">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-100 text-gray-500 transition-all"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">
              AI SDLC Dashboard
            </h2>
          </div>

          {/* Webhook Connection Form (Top Right) */}
          <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200 w-full md:w-auto">
            <input
              type="text"
              placeholder="ws://localhost:8080"
              value={baseEndpoint}
              onChange={(e) => setBaseEndpoint(e.target.value)}
              disabled={isConnected}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white min-w-[150px] flex-1 md:flex-none outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={isConnected}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white w-28 flex-1 md:flex-none outline-none focus:border-blue-500"
            />

            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded font-medium transition-colors"
              >
                <Unlink size={14} /> Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
              >
                <Link2 size={14} /> Connect
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-32">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar with Lucide Icons */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-5 py-3.5 max-w-[85%] text-base leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-white text-gray-800 rounded-2xl rounded-tr-sm border border-gray-200"
                      : "bg-transparent text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-10 pb-6 px-4 md:px-8">
          <div className="max-w-3xl mx-auto relative">
            <form
              onSubmit={handleSendMessage}
              className="relative flex items-end bg-white border border-gray-300 rounded-3xl shadow-sm overflow-hidden transition-colors focus-within:border-blue-500"
            >
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isConnected
                    ? "Message testing server..."
                    : "Connect to webhook first..."
                }
                className="w-full max-h-[200px] min-h-[56px] py-4 pl-6 pr-14 bg-transparent outline-none resize-none text-gray-800"
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-3 bottom-3 p-2 rounded-full bg-blue-600 text-white disabled:opacity-30 disabled:bg-gray-400 transition-all hover:scale-105 active:scale-95"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
