"use client";

import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const useWebSockets = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<{ [key: string]: ((data: any) => void)[] }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    let user_id: string | null = null;
    try {
      const decoded: any = jwtDecode(token);
      user_id = decoded.user_id || decoded.sub || decoded.id;
    } catch (e) {
      console.error("Failed to decode token", e);
    }

    if (!user_id) {
      console.warn(
        "No user_id found in token, WebSocket connection might fail"
      );
    }

    const isSecure = window.location.protocol === "https:";
    const protocol = isSecure ? "wss" : "ws";
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

        const eventName = data.event || "message";
        const eventPayload = data.data || data;

        // Trigger local listeners from the shim
        if (listenersRef.current[eventName]) {
          listenersRef.current[eventName].forEach((cb) => cb(eventPayload));
        }

        // Global event dispatch
        window.dispatchEvent(
          new CustomEvent(`ws:${eventName}`, { detail: eventPayload })
        );
      } catch (e) {
        console.error("Failed to parse WebSocket message", e);
      }
    };

    socket.onclose = (event) => {
      setConnected(false);
      console.log(`Disconnected from WebSocket Gateway (Code: ${event.code})`);
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

  // Socket.io-like shim
  const socketShim = {
    on: (event: string, callback: (data: any) => void) => {
      if (!listenersRef.current[event]) {
        listenersRef.current[event] = [];
      }
      listenersRef.current[event].push(callback);
    },
    off: (event: string, callback: (data: any) => void) => {
      if (listenersRef.current[event]) {
        listenersRef.current[event] = listenersRef.current[event].filter(
          (cb) => cb !== callback
        );
      }
    },
    send: (data: any) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(data));
      }
    },
    get readyState() {
      return socketRef.current?.readyState;
    },
  };

  return { socket: socketShim, connected };
};
