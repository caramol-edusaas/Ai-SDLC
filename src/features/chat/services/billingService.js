import aiClient from "../../../services/aiClient";

export const billingService = {
  // 1. Get Wallet Balance
  getWalletBalance: async (userId) => {
    const response = await aiClient.get(`/billing/user/balance/${userId}`);
    return response.data;
  },

  // 2. Add Money to Wallet
  addMoneyToWallet: async (userId, amount) => {
    const response = await aiClient.post(
      `/billing/user/wallet/add/${userId}/${amount}`,
    );
    return response.data;
  },

  // 3. Get Total Billing Summary (New)
  getBillingSummary: async (userId) => {
    // Note: Adjust the endpoint if it exactly matches '/billing/user/{userId}' or '/billing/user/{userId}/summary'
    const response = await aiClient.get(`/billing/user/${userId}`);
    return response.data;
  },

  // 4. Get Project Specific Usage (New)
  getProjectUsage: async (projectId) => {
    const response = await aiClient.get(
      `/billing/user/usage/details/${projectId}`,
    );
    return response.data;
  },
};
