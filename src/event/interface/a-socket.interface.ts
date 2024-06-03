import { Socket } from "socket.io";

export interface ASocket extends Socket {
    userId: number;
}