import React, { useState } from "react";
import { User, Sparkles, Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AppColors } from "../../../utils/AppColors";
import { useChat } from "../../../context/ChatContext";

// Custom component for Code Blocks with Copy functionality
const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const { messages } = useChat();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="my-4 rounded-xl overflow-hidden border"
      style={{ borderColor: AppColors.borderHighlight }}
    >
      {/* Code Block Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: "#1E1E22" }}
      >
        <span
          className="text-xs font-mono"
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
      {/* Code Syntax Highlighter */}
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
  );
};

export default function ChatCanvas() {
  // Updated dummy data with a code block for testing
  const { messages } = useChat();
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-50">
          <Sparkles size={48} color={AppColors.textMuted} className="mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            What are we building today?
          </h2>
          <p className="text-sm" style={{ color: AppColors.textMuted }}>
            Type a prompt below to start generating your AI project.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-4 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "ai" && (
            <div
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
              style={{
                backgroundColor: AppColors.surface,
                border: `1px solid ${AppColors.border}`,
              }}
            >
              <Sparkles size={16} color={AppColors.primary} />
            </div>
          )}

          <div
            className={`max-w-[90%] md:max-w-[80%] p-4 text-sm leading-relaxed overflow-x-auto`}
            style={{
              backgroundColor:
                msg.role === "user" ? AppColors.userBubble : AppColors.aiBubble,
              color:
                msg.role === "user" ? AppColors.textMain : AppColors.textMuted,
              borderRadius: msg.role === "user" ? "24px 24px 4px 24px" : "8px",
              color: msg.role === "ai" ? "#E4E4E7" : AppColors.textMain,
            }}
          >
            {/* ReactMarkdown is rendering the text and code here */}
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
                      className="bg-[#27272A] px-1.5 py-0.5 rounded text-[#3B82F6]"
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
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-blue-600">
              <User size={16} color="#FFF" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
