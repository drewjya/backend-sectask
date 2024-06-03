import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { Response } from 'src/transform/transform.interceptor';

export class CustomPipe {
  static validation() {
    return new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        let obj = {};
        for (const key of errors) {
          if (key.children && key.children.length > 0) {
            for (const child of key.children) {
              const arr = child.children.map((e) => {
                return {
                  constraints: e.constraints[Object.keys(e.constraints)[0]],
                  property: e.property,
                };
              });

              let objArr = {};
              for (const iterator of arr) {
                objArr[iterator.property] = iterator.constraints;
              }

              obj[key.property] = objArr;
            }
          } else {
            obj[key.property] =
              key.constraints[Object.keys(key.constraints)[0]];
          }
        }
        const res: Response<any> = {
          data: null,
          message: 'invalid_request',
          status: HttpStatus.BAD_REQUEST,
          error: obj,
        };
        throw new HttpException(res, HttpStatus.BAD_REQUEST);
      },
      stopAtFirstError: true,
    });
  }
}
