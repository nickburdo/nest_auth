import { AuthService } from '@auth/auth.service';
import { JwtPayload } from '@auth/interfaces';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOne(payload.id).catch((error) => {
      this.logger.error(error);

      return null;
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
