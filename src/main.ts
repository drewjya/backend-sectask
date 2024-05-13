import { ClassSerializerInterceptor } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthFilter } from './auth/auth.filter';
import { PrismaClientExceptionFilter } from './prisma/prisma.filter';
import { TransformInterceptor } from './transform/transform.interceptor';
import { SocketAdapter } from './utils/adapter/socket.adapter';
import { CustomPipe } from './utils/pipe/custom.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  app.useGlobalPipes(CustomPipe.validation());
  app.useWebSocketAdapter(new SocketAdapter(app));
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const httpAdapter = app.get(HttpAdapterHost).httpAdapter.getInstance();
  const prismaFilter = new PrismaClientExceptionFilter(httpAdapter);
  const authFilter = new AuthFilter(httpAdapter);
  app.useGlobalFilters(prismaFilter);
  app.useGlobalFilters(authFilter);
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(3000);
}
bootstrap();
