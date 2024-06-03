import { WsGuard } from 'src/common/guard/ws.guard';
import { ASocket } from 'src/event/interface/a-socket.interface';

type SocketIOMiddleWare = {
  (client: ASocket, next: (err?: Error) => void): void;
};

export const SocketAuthMiddleware = ():SocketIOMiddleWare => {
  return async (client, next) => {
    try {
      let user = await WsGuard.validateToken(client);
      client.userId = +user.sub;
      next();
    } catch (error) {
      next(error);
    }
  };
};
