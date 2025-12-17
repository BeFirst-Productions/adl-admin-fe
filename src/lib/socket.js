// src/lib/socket.js
import { getAccessToken } from "@/api/tokenService";
import { io } from "socket.io-client";

let socket = null;

/**
 * Connects a socket and returns it. Reuses existing connection.
 * - url: server url (e.g. import.meta.env.VITE_API_URL or explicit)
 * - opts: { autoConnect: true/false }
 */
export function connectSocket(url = import.meta.env.VITE_API_WS_URL || import.meta.env.VITE_API_URL, opts = {}) {
  if (socket && socket.connected) return socket;

  const token = getAccessToken();
  socket = io(url, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
    ...opts,
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connect_error:", err && err.message);
  });
  socket.on("connect", () => {
    console.debug("Socket connected:", socket.id);
  });
  socket.on("disconnect", (reason) => {
    console.debug("Socket disconnected:", reason);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
