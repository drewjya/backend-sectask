import { Socket } from 'socket.io';
import { WsJwtGuard } from './ws-jwt.guard';

type SocketIOMiddleWare = {
  (client: Socket, next: (err?: Error) => void): void;
};

export const SocketAuthMiddleware = ():SocketIOMiddleWare => {
  return (client, next) => {
    try {
      WsJwtGuard.validateToken(client);
      next();
    } catch (error) {
      next(error);
    }
  };
};
