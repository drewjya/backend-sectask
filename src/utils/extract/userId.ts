import { Request } from 'express';
import { unauthorized } from '../exception/common.exception';

export function extractUserId(req: Request) {
  const user = req.user['sub'];

  if (!user) {
    throw unauthorized;
  }
  return user;
}
