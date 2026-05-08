import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface RequestWithCookies {
  cookies?: {
    access_token?: string;
    [key: string]: any;
  };
  headers?: {
    authorization?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: RequestWithCookies) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['access_token'];
        }
        if (!token && req.headers && req.headers.authorization) {
          const authHeader = req.headers.authorization;
          if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
          }
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret') || 'default_secret',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.role ? [payload.role] : [],
    };
  }
}
