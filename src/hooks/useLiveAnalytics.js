// src/hooks/useLiveAnalytics.js
import { useEffect, useState, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

/**
 * useLiveAnalytics(options)
 * - options: { initialFetch: fn (optional) } - called once to fetch initial data (fallback)
 */
export default function useLiveAnalytics({ initialFetch } = {}) {
  const [live, setLive] = useState(null);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    // connect socket; reuse same URL set in env
    const socket = connectSocket();
    socketRef.current = socket;

    const onLive = (payload) => {
      if (!mounted) return;
      setLive(payload);
    };
    const onError = (payload) => {
      if (!mounted) return;
      setError(payload?.message || "Live analytics temporarily unavailable");
    };

    socket.on("analytics:live", onLive);
    socket.on("analytics:error", onError);

    // If socket doesn't send updates quickly, fallback to initialFetch (if provided)
    const fallbackTimer = setTimeout(async () => {
      if (!mounted) return;
      if (!live && typeof initialFetch === "function") {
        try {
          const data = await initialFetch();
          if (mounted) setLive(data.data || data);
        } catch (e) {
          console.warn("Initial analytics fetch failed:", e);
          if (mounted) setError("Failed to load analytics");
        }
      }
    }, 1200); // 1.2s wait for live before fallback

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      if (socket) {
        socket.off("analytics:live", onLive);
        socket.off("analytics:error", onError);
      }
      // do not disconnect global socket here — keep connection reused across pages.
      // if you want to disconnect, call disconnectSocket() explicitly when user logs out.
    };
  }, []); // run once

  return { live, error, socket: socketRef.current };
}
