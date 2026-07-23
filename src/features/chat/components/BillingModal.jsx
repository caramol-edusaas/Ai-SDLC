import React, { useState, useEffect } from "react";
import { X, Activity, Coins, Zap } from "lucide-react";
import { AppColors } from "../../../utils/AppColors";
import { billingService } from "../services/billingService";

export default function BillingModal({ isOpen, onClose, userId, projectId }) {
  const [summary, setSummary] = useState(null);
  const [projectUsage, setProjectUsage] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchAnalytics();
    }
  }, [isOpen, userId, projectId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const summaryResult = await billingService.getBillingSummary(userId);
      if (summaryResult.success) {
        const summaryData = Array.isArray(summaryResult.data)
          ? summaryResult.data[0]
          : summaryResult.data;
        setSummary(summaryData);
      }

      if (projectId) {
        const usageResult = await billingService.getProjectUsage(projectId);
        if (usageResult.success) {
          setProjectUsage(usageResult.data);
        }
      } else {
        setProjectUsage([]);
      }
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-2xl p-4 sm:p-6 rounded-2xl shadow-2xl relative flex flex-col gap-4 sm:gap-6"
        style={{
          backgroundColor: AppColors.background,
          border: `1px solid ${AppColors.borderHighlight}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-lg sm:text-xl font-bold flex items-center gap-2"
            style={{ color: AppColors.textMain }}
          >
            <Activity size={24} color={AppColors.primary} />
            Usage Analytics
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} color={AppColors.textMuted} />
          </button>
        </div>

        {loading ? (
          <div
            className="text-center py-10 opacity-70"
            style={{ color: AppColors.textMuted }}
          >
            Loading your analytics...
          </div>
        ) : (
          <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
            {/* OVERALL SUMMARY CARDS */}
            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl flex flex-col gap-1"
                  style={{
                    backgroundColor: AppColors.surface,
                    border: `1px solid ${AppColors.border}`,
                  }}
                >
                  <span
                    className="text-xs uppercase font-bold tracking-wider flex items-center gap-1"
                    style={{ color: AppColors.textMuted }}
                  >
                    <Coins size={14} /> Total Cost
                  </span>
                  <span
                    className="text-xl sm:text-2xl font-black"
                    style={{ color: AppColors.textMain }}
                  >
                    ${summary.totalCost?.toFixed(4) || "0.0000"}
                  </span>
                </div>

                <div
                  className="p-4 rounded-xl flex flex-col gap-1"
                  style={{
                    backgroundColor: AppColors.surface,
                    border: `1px solid ${AppColors.border}`,
                  }}
                >
                  <span
                    className="text-xs uppercase font-bold tracking-wider flex items-center gap-1"
                    style={{ color: AppColors.textMuted }}
                  >
                    <Zap size={14} /> Total Tokens
                  </span>
                  <span
                    className="text-xl sm:text-2xl font-black"
                    style={{ color: AppColors.textMain }}
                  >
                    {summary.totalTokens?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            )}

            {/* PROJECT SPECIFIC DETAILS TABLE */}
            {projectUsage.length > 0 && (
              <div>
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: AppColors.textMuted }}
                >
                  Current Project Detail (ID: {projectId})
                </h3>
                <div
                  className="rounded-xl overflow-x-auto custom-scrollbar w-full"
                  style={{ border: `1px solid ${AppColors.border}` }}
                >
                  <table className="w-full text-left text-sm min-w-[400px]">
                    <thead
                      style={{
                        backgroundColor: AppColors.surface,
                        color: AppColors.textMuted,
                      }}
                    >
                      <tr>
                        <th className="p-3 font-medium">Model</th>
                        <th className="p-3 font-medium">Input (Tokens)</th>
                        <th className="p-3 font-medium">Output (Tokens)</th>
                        <th className="p-3 font-medium text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectUsage.map((usage, idx) => (
                        <tr
                          key={idx}
                          className="border-t"
                          style={{
                            borderColor: AppColors.border,
                            color: AppColors.textMain,
                          }}
                        >
                          <td className="p-3">{usage.modelName}</td>
                          <td className="p-3">{usage.inputTokens}</td>
                          <td className="p-3">{usage.outputTokens}</td>
                          <td className="p-3 text-right font-medium text-green-400">
                            ${usage.totalCost?.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!projectId || projectUsage.length === 0) && (
              <div
                className="text-xs text-center italic mt-2"
                style={{ color: AppColors.textMuted }}
              >
                Select a project or generate a chat to see detailed breakdown.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
