import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./socketTypes";

const SERVER_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(
  token?: string | null,
): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket) return socket;

  socket = io(SERVER_URL, {
    auth: token ? { token } : {},
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
