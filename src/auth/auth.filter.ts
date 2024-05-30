import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response, response } from 'express';
import { ApiException } from 'src/utils/exception/api.exception';

@Catch(ApiException)
export class AuthFilter extends BaseExceptionFilter {
  catch(exception: ApiException, host: ArgumentsHost) {
    console.error(exception.message); // 3
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let error = {};
    const resp = exception.getResponse();
    let message = 'invalid_request';
    if (typeof resp === 'string' || resp instanceof String) {
      error['@root'] = resp;
      message = `${resp}`;
    } else {
      error = resp;
    }

    const errorResponse = {
      status: status,
      error: error,
      message: message,
      data: null,
    };

    response.status(status).json(errorResponse);
  }
}

@Catch(InternalServerErrorException)
export class InternalServerFilter extends BaseExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost): void {
    const message = 'internal_error';

    const ctx = host.switchToHttp();

    const status = exception.getStatus();
    let error = {};
    const resp = exception.getResponse();
    error['@root'] = message;
    error['error'] = `${exception.message} | ${exception.stack}`;
    const errorResponse = {
      status: status,
      error: error,
      message: message,
      data: null,
    };
    response.status(status).json(errorResponse);
  }
}

// @Catch()
// export class AllExceptionsFilter extends BaseExceptionFilter {
//   catch(exception: unknown, host: ArgumentsHost) {
//     console.log(
//       `ERROR ${exception['name']}: MESSGAE ${exception['clientVersion']} STATUS ${exception}`,
//     );

//     const message = 'internal_error';

//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();

//     const status = HttpStatus.INTERNAL_SERVER_ERROR;
//     let error = {};
//     error['@root'] = message;

//     const errorResponse = {
//       status: status,
//       error: error,
//       message: message,
//       data: null,
//     };
//     response.status(status).json(errorResponse);
//   }
// }
