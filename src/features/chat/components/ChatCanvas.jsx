// src/features/chat/components/ChatCanvas.jsx
import React, { useState } from "react";
import { User, Sparkles, Check, Copy, Activity } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AppColors } from "../../../utils/AppColors";
import { useChat } from "../../../context/ChatContext";

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="my-4 rounded-xl overflow-hidden border w-full"
      style={{ borderColor: AppColors.borderHighlight }}
    >
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2"
        style={{ backgroundColor: "#1E1E22" }}
      >
        <span
          className="text-[10px] sm:text-xs font-mono"
          style={{ color: AppColors.textMuted }}
        >
          {language || "text"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: copied ? "#10B981" : AppColors.textMuted }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <div className="overflow-x-auto w-full custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            backgroundColor: "#0D0D0F",
            fontSize: "13px",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default function ChatCanvas() {
  const { messages, workflowState, isGenerating } = useChat();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8 pb-10 px-2 sm:px-0">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-50 px-4">
          <Sparkles
            size={40}
            color={AppColors.textMuted}
            className="mb-4 sm:size-12"
          />
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            What are we building today?
          </h2>
          <p
            className="text-xs sm:text-sm"
            style={{ color: AppColors.textMuted }}
          >
            Type a prompt below to start generating your AI project.
          </p>
        </div>
      )}

      {messages.map((msg, index) => (
        <div
          key={msg.id || index}
          className={`flex gap-2 sm:gap-4 w-full ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {msg.role === "ai" && (
            <div
              className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mt-1"
              style={{
                backgroundColor: AppColors.surface,
                border: `1px solid ${AppColors.border}`,
              }}
            >
              <Sparkles
                size={14}
                className="sm:w-4 sm:h-4"
                color={AppColors.primary}
              />
            </div>
          )}

          <div
            className={`max-w-[95%] md:max-w-[80%] p-3 sm:p-4 text-sm leading-relaxed overflow-x-auto`}
            style={{
              backgroundColor:
                msg.role === "user" ? AppColors.userBubble : AppColors.aiBubble,
              color: msg.role === "ai" ? "#E4E4E7" : AppColors.textMain,
              borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "8px",
            }}
          >
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <CodeBlock
                      language={match[1]}
                      value={String(children).replace(/\n$/, "")}
                    />
                  ) : (
                    <code
                      className="bg-[#27272A] px-1.5 py-0.5 rounded text-[#3B82F6] break-words whitespace-pre-wrap"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>

          {msg.role === "user" && (
            <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mt-1 bg-blue-600">
              <User size={14} className="sm:w-4 sm:h-4" color="#FFF" />
            </div>
          )}
        </div>
      ))}

      {/* Render the Workflow Status visually inside the canvas stream */}
      {workflowState && workflowState.taskState && (
        <div className="flex gap-2 sm:gap-4 w-full justify-start mt-2">
          <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mt-1 bg-blue-900/40 border border-blue-500/30">
            <Activity size={14} color="#60A5FA" />
          </div>
          <div className="w-full max-w-[95%] md:max-w-[80%] p-4 border rounded-xl bg-[#131b2f] border-[#2b376d] shadow-sm">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
              Workflow Sync Update
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
              <div>
                <span className="text-gray-500 text-xs block mb-1">State</span>
                <span className="font-medium bg-blue-900/30 px-2 py-1 rounded text-blue-300">
                  {workflowState.taskState}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block mb-1">
                  Next Action
                </span>
                <span className="font-medium text-gray-200">
                  {workflowState.nextAction || "None"}
                </span>
              </div>
              {workflowState.pendingQuestion && (
                <div className="col-span-1 md:col-span-2 mt-2 pt-3 border-t border-[#2b376d]/50">
                  <span className="text-yellow-500/80 text-xs block mb-1">
                    Pending Question
                  </span>
                  <span className="font-medium text-yellow-100">
                    {workflowState.pendingQuestion}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="flex gap-2 sm:gap-4 w-full justify-start items-center">
          <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-transparent">
            <Sparkles
              size={14}
              className="animate-pulse"
              color={AppColors.textMuted}
            />
          </div>
          <div className="text-sm italic text-gray-500 animate-pulse">
            Generating response...
          </div>
        </div>
      )}
    </div>
  );
}
