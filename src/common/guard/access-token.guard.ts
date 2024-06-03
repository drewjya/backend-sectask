import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { unauthorized } from 'src/utils/exception/common.exception';
import { VCacheService } from 'src/vcache/vcache.service';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private cache: VCacheService) {
    super()
  }
  async canActivate(context: ExecutionContext) {
    try {
      const load = await super.canActivate(context);


      if (load) {
        const request = context.switchToHttp().getRequest<Request>();
        const verify = request.user['sessionId']
        const userId = request.user['sub']
        await this.cache.verifySessionUser(+userId, verify)
        return true;
      } else {

        throw unauthorized;
      }
    } catch (error) {

      throw unauthorized;
    }
  }
}
