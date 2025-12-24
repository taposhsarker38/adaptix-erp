"use client";

import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const useWebSockets = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    let user_id: string | null = null;
    try {
      const decoded: any = jwtDecode(token);
      // Try multiple common claims for user ID
      user_id = decoded.user_id || decoded.sub || decoded.id;
    } catch (e) {
      console.error("Failed to decode token", e);
    }

    if (!user_id) {
      console.warn(
        "No user_id found in token, WebSocket connection might fail"
      );
    }

    // Determine the environment-specific WebSocket protocol (ws or wss)
    const isSecure = window.location.protocol === "https:";
    const protocol = isSecure ? "wss" : "ws";

    // Fallback to localhost:8101 (Kong) if NEXT_PUBLIC_WS_URL is not set
    // Note: NEXT_PUBLIC_WS_URL normally shouldn't include protocol if we handle it dynamically
    const wsHost = process.env.NEXT_PUBLIC_WS_URL
      ? process.env.NEXT_PUBLIC_WS_URL.replace(/^https?:\/\//, "")
      : "localhost:8101";

    const wsUrl = `${protocol}://${wsHost}/api/ws/notifications/?user_id=${user_id}`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      console.log("Connected to WebSocket Gateway");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        // Dispatch a custom event so components can listen globally
        window.dispatchEvent(
          new CustomEvent("ws-notification", { detail: data })
        );
      } catch (e) {
        console.error("Failed to parse WebSocket message", e);
      }
    };

    socket.onclose = (event) => {
      setConnected(false);
      console.log(`Disconnected from WebSocket Gateway (Code: ${event.code})`);

      // Optional: Add reconnection logic here if needed
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, []);

  return { socket: socketRef.current, connected };
};
