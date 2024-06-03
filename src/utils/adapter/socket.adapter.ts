import { IoAdapter } from '@nestjs/platform-socket.io';
import { SocketAuthMiddleware } from 'src/middleware/socket-auth.middleware';


export class SocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, { ...options, cors: true });

    server.use(SocketAuthMiddleware() as any);

    return server;
  }
}
