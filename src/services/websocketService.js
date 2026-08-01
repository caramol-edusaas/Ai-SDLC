// src/features/chat/services/websocketService.js (or wherever you placed it)
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export class WebSocketService {
  constructor() {
    this.socket = null;
    this.stompClient = null;
  }

  connect(baseUrl, token, userId, onMessageCallback) {
    if (this.stompClient && this.stompClient.connected) {
      console.log("WebSocket already connected.");
      return;
    }

    if (!userId || !token) {
      console.error("User ID and Token are required for WebSocket.");
      return;
    }

    try {
      const wsUrl = `${baseUrl}/ws`;
      this.socket = new SockJS(wsUrl);
      this.stompClient = Stomp.over(this.socket);

      // Disable spammy console logs unless debugging
      this.stompClient.debug = () => {};

      // Connect with Bearer Token
      const headers = { Authorization: `Bearer ${token}` };

      this.stompClient.connect(
        headers,
        () => {
          console.log("WebSocket Connected Successfully via STOMP");

          // Subscribe to the exact path client provided
          this.stompClient.subscribe(`/message/user/${userId}`, (frame) => {
            try {
              const body = JSON.parse(frame.body);
              const payloadData = body.payload ? body.payload : body;

              if (onMessageCallback) {
                onMessageCallback(payloadData);
              }
            } catch (e) {
              console.error("WS parse exception:", frame.body);
            }
          });
        },
        (error) => {
          console.error("WebSocket connect failed:", error);
        },
      );
    } catch (err) {
      console.error("WebSocket error:", err.message);
    }
  }

  sendMessage(destination, payload) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(destination, {}, JSON.stringify(payload));
    }
  }

  disconnect() {
    try {
      if (this.stompClient) {
        if (this.stompClient.connected) {
          this.stompClient.disconnect(() => {
            console.log("WebSocket Disconnected");
          });
        }
        this.stompClient = null;
      }

      // Check if socket exists and is open/opening before calling close
      if (this.socket) {
        if (
          this.socket.readyState === SockJS.OPEN ||
          this.socket.readyState === SockJS.CONNECTING
        ) {
          this.socket.close();
        }
        this.socket = null;
      }
    } catch (err) {
      console.warn(
        "Error during websocket disconnect gracefully handled:",
        err.message,
      );
    }
  }
}

export const wsService = new WebSocketService();
