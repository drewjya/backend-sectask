import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { ApiException } from 'src/utls/exception/api.exception';

@Catch(ApiException)
export class AuthFilter extends BaseExceptionFilter {
  catch(exception: ApiException, host: ArgumentsHost) {
    console.error(exception.message); // 3
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    let error = {};
    const resp = exception.getResponse();

    if (typeof resp === 'string' || resp instanceof String) {
      error['@root'] = resp;
    } else {
      error = resp;
    }

    console.log(exception);

    const errorResponse = {
      status: status,
      error: error,
      message: 'invalid_request',
      data: null,
    };

    response.json(errorResponse).status(status);
  }
}
