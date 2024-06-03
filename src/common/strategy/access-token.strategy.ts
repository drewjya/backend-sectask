import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { unauthorized } from 'src/utils/exception/common.exception';
import { VCacheService } from 'src/vcache/vcache.service';

type JwtPayload = {
  sub: string;
  email: string;
  sessionId: string
};

export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private cache: VCacheService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const accessToken = req.get('Authorization').replace('Bearer', '').trim();
    if (!payload.sessionId) {
      throw unauthorized;
    }
    return { ...payload, accessToken };
  }
}
