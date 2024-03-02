import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { ApiException } from 'src/utls/exception/api.exception';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }
    const client: Socket = context.switchToWs().getClient();
    WsJwtGuard.validateToken(client);
    return true;
  }

  static validateToken(client: Socket) {
    const authorization =
      client.handshake.auth.token ?? client.handshake.headers.authorization;

    if (!authorization) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
    }
    const token: string = authorization.split(' ')[1];
    const payload = verify(token, process.env.JWT_ACCESS_SECRET);

    return payload;
  }
}
