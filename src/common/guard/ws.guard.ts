import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { unauthorized } from 'src/utils/exception/common.exception';

@Injectable()
export class WsGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }
    const client: Socket = context.switchToWs().getClient();
    WsGuard.validateToken(client);
    return true;
  }

  static validateToken(client: Socket) {
    const authorization =
      client.handshake.auth.token ?? client.handshake.headers.authorization;

    if (!authorization) {
      throw unauthorized;
    }
    const token: string = authorization.split(' ')[1];
    const payload = verify(token, process.env.JWT_ACCESS_SECRET);

    return payload;
  }
}
