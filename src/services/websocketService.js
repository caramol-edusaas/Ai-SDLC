export class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxAttempts = 5;
  }

  connect(baseUrl, token, projectId) {
    // Assuming backend WS URL standard conversion (http -> ws)
    const wsUrl =
      baseUrl.replace(/^http/, "ws") +
      `/ws/chat?token=${token}&projectId=${projectId || ""}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket Connected Successfully");
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle the exact error format from image_996d97.jpg
      if (data.success === false && data.status === 401) {
        console.error("WebSocket Auth Error:", data.message);
        alert(`Session Expired: ${data.message}`);
        return;
      }

      // TODO: Here you dispatch real-time stream to your ChatContext or UI
      console.log("Stream received:", data);
    };

    this.socket.onclose = () => {
      if (this.reconnectAttempts < this.maxAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(baseUrl, token, projectId);
        }, 2000 * this.reconnectAttempts);
      }
    };

    this.socket.onerror = (err) => {
      console.error("WebSocket Error:", err);
    };
  }

  sendMessage(payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
