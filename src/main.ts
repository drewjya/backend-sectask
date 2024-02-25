import {
  ClassSerializerInterceptor,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthFilter } from './auth/auth.filter';
import { PrismaClientExceptionFilter } from './prisma/prisma.filter';
import { SocketAdapter } from './utls/adapter/socket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        let obj = {};
        for (const key of errors) {
          obj[key.property] = key.constraints[Object.keys(key.constraints)[0]];
        }
        throw new HttpException(
          {
            message: 'invalid_request',
            status: HttpStatus.BAD_REQUEST,
            error: obj,
          },
          400,
        );
      },
      stopAtFirstError: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useWebSocketAdapter(new SocketAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalFilters(new AuthFilter(httpAdapter));
  await app.listen(3000);
}
bootstrap();
