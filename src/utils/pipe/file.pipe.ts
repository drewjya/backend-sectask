import { ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlink } from 'fs';
import { diskStorage } from 'multer';
import { uuid } from 'src/common/uuid';
import { ApiException } from '../exception/api.exception';

export function parseFile(param: { isRequired: boolean }) {
  return new ParseFilePipe({
    fileIsRequired: param.isRequired,
    exceptionFactory: param.isRequired
      ? (err) => {
          return new ApiException({
            status: 400,
            data: {
              file: 'File is required',
            },
          });
        }
      : null,
  });
}

export const uploadConfig = (path?: string) => {
  return FileInterceptor(path ?? 'file', {
    limits: {
      fileSize: Number(process.env.MAX_FILE_SIZE),
    },
    storage: diskStorage({
      destination: process.env.STATIC_PATH,
      filename: (req, file, cb) => {
        const ext = file.originalname.split('.');
        const val = uuid();
        const originalName = file.originalname;

        // Attach the original name to the request object
        if (!req.body) {
          req.body = {};
        }
        req.body.originalName = originalName;

        cb(null, `${val}.${ext[ext.length - 1]}`);
      },
    }),
  });
};

export function removeStoragePath(val?: string) {
  if (!val) {
    return null;
  }
  return val.replace(process.env.STATIC_PATH + '/', '');
}

export function addStoragePath(val: string) {
  return `${process.env.STATIC_PATH}/${val}`;
}

export function unlinkFile(val: string) {
  unlink(addStoragePath(val), (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}
