import { Socket } from "socket.io";

export interface AuthSocket extends Socket {
    userId: number;
 }