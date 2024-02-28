import { Socket } from "socket.io";

export interface AuthSocker extends Socket {
    userId: number;
 }