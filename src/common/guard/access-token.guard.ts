import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { unauthorized } from 'src/utils/exception/common.exception';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    try {
      const load = await super.canActivate(context);
      if (load) {
        return true;
      }
      throw unauthorized;
    } catch (error) {
      throw unauthorized;
    }
  }
}
