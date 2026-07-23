// src/features/chat/DashboardPage.jsx
import React, { useState } from "react";
import { AppColors } from "../../utils/AppColors";
import Sidebar from "./components/Sidebar";
import CommandInput from "./components/CommandInput";
import ChatCanvas from "./components/ChatCanvas";
import { Menu } from "lucide-react"; // Import Menu icon for the hamburger

export default function DashboardPage() {
  // State to manage mobile sidebar visibility
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div
      className="flex h-screen w-full overflow-hidden font-sans selection:bg-blue-500/30"
      style={{
        backgroundColor: AppColors.background,
        color: AppColors.textMain,
      }}
    >
      {/* ================= MOBILE OVERLAY ================= */}
      {/* Clicking this dark background on mobile closes the sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ================= LEFT SIDEBAR (Pane 1) ================= */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* ================= MAIN CHAT CANVAS (Pane 2) ================= */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Mobile Top Bar (Hidden on desktop) */}
        <div
          className="md:hidden flex items-center p-4 border-b z-10 sticky top-0"
          style={{
            borderColor: AppColors.border,
            backgroundColor: AppColors.surface,
          }}
        >
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu size={24} color={AppColors.textMain} />
          </button>
          <span className="ml-3 font-semibold text-lg">Dashboard</span>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-32 custom-scrollbar">
          <ChatCanvas />
        </div>

        {/* Bottom Input Area (Fixed to bottom) */}
        <div
          className="absolute bottom-0 w-full pt-10 pb-6 px-4 md:px-8 z-10"
          style={{
            background: `linear-gradient(to top, ${AppColors.background} 70%, transparent)`,
          }}
        >
          <CommandInput />
        </div>
      </main>
    </div>
  );
}
