import {
  ClassSerializerInterceptor,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthFilter } from './auth/auth.filter';
import { PrismaClientExceptionFilter } from './prisma/prisma.filter';
import {
  Response,
  TransformInterceptor,
} from './transform/transform.interceptor';
import { SocketAdapter } from './utils/adapter/socket.adapter';
import { createSwagger } from './utils/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        let obj = {};
        for (const key of errors) {
          obj[key.property] = key.constraints[Object.keys(key.constraints)[0]];
        }
        const res: Response<any> = {
          data: null,
          message: 'invalid_request',
          status: HttpStatus.BAD_REQUEST,
          error: obj,
        };
        throw new HttpException(res, 400);
      },
      stopAtFirstError: true,
    }),
  );
  app.useWebSocketAdapter(new SocketAdapter(app));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  createSwagger(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalFilters(new AuthFilter(httpAdapter));
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(3000);
}
bootstrap();
