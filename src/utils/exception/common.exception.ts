import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';

export const unauthorized = new ApiException({
  data: 'unauthorized',
  status: HttpStatus.UNAUTHORIZED,
});

export const forbidden = new ApiException({
  data: 'forbidden',
  status: HttpStatus.FORBIDDEN,
});

export const notfound = new ApiException({
  data: 'no_resource',
  status: HttpStatus.NOT_FOUND,
});
export const uploadFail = new ApiException({
  data: 'upload_fail',
  status: HttpStatus.BAD_REQUEST,
});

export const updateFail = new ApiException({
  data: 'update_fail',
  status: HttpStatus.BAD_REQUEST,
});

export const uploadSuccess = 'upload_success';
export const updateSuccess = 'upload_success';
