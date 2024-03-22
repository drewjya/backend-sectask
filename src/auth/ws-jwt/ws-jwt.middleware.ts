import { AuthSocket } from 'src/utils/interface/authsocket.interface';
import { WsJwtGuard } from './ws-jwt.guard';

type SocketIOMiddleWare = {
  (client: AuthSocket, next: (err?: Error) => void): void;
};

export const SocketAuthMiddleware = (): SocketIOMiddleWare => {
  return async (client, next) => {
    try {
      let user = await WsJwtGuard.validateToken(client);
      client.userId = +user.sub;
      next();
    } catch (error) {
      next(error);
    }
  };
};
