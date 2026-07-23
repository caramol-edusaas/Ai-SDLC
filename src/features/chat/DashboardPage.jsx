// src/features/chat/DashboardPage.jsx
import React from "react";
import { AppColors } from "../../utils/AppColors";
import Sidebar from "./components/Sidebar";
import CommandInput from "./components/CommandInput";
import ChatCanvas from "./components/ChatCanvas";

// Future Imports (Hum inko next steps me banayenge)
// import Sidebar from "./components/Sidebar";
// import ChatCanvas from "./components/ChatCanvas";
// import CommandInput from "./components/CommandInput";

export default function DashboardPage() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden font-sans selection:bg-blue-500/30"
      style={{
        backgroundColor: AppColors.background,
        color: AppColors.textMain,
      }}
    >
      {/* ================= LEFT SIDEBAR (Pane 1) ================= */}
      <Sidebar />

      {/* ================= MAIN CHAT CANVAS (Pane 2) ================= */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-32 custom-scrollbar">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-32 custom-scrollbar">
            <ChatCanvas />
          </div>
        </div>

        {/* Bottom Input Area (Fixed to bottom) */}
        <div
          className="absolute bottom-0 w-full pt-10 pb-6 px-4 md:px-8"
          style={{
            background: `linear-gradient(to top, ${AppColors.background} 70%, transparent)`,
          }}
        >
          <div
            className="absolute bottom-0 w-full pt-10 pb-6 px-4 md:px-8 z-10"
            style={{
              background: `linear-gradient(to top, ${AppColors.background} 70%, transparent)`,
            }}
          >
            <CommandInput />
          </div>
        </div>
      </main>
    </div>
  );
}
