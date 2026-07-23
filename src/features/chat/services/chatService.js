import aiClient from "../../../services/aiClient";

export const chatService = {
  // 1. Submit Chat
  submitChat: async (projectId, message, exstatus = null, prstatus = null) => {
    const payload = {
      projectId: projectId ? parseInt(projectId) : null,
      message: message,
      exstatus: exstatus,
      prstatus: prstatus,
    };
    const response = await aiClient.post("/chat/submit", payload);
    return response.data;
  },

  // 2. Load All Projects for Sidebar
  // GET: /chat/user/projects
  loadProjects: async () => {
    const response = await aiClient.get("/chat/user/projects");
    return response.data;
  },

  // 3. Load Chat History by Project ID
  // GET: /chat/user/conversations/{projectId}
  getConversations: async (projectId) => {
    const response = await aiClient.get(
      `/chat/user/conversations/${projectId}`,
    );
    return response.data;
  },
};
