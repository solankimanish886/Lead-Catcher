import { io, Socket } from "socket.io-client";

const socketUrl = window.location.origin;

export const socket: Socket = io(socketUrl, {
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
});

socket.on("connect", () => {
    console.log(`[Client Socket] Connected: ${socket.id}`);
});

socket.on("connect_error", (err) => {
    console.error(`[Client Socket] Connection error:`, err);
});

export const connectSocket = (userId: number) => {
    if (!socket.connected) {
        console.log(`[Client Socket] Explicitly connecting...`);
        socket.connect();
    }
    console.log(`[Client Socket] Emitting join:dashboard for userId: ${userId}`);
    socket.emit("join:dashboard", userId);
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
