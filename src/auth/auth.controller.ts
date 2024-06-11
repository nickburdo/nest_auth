import { LoginDto } from '@auth/dto/login.dto';
import { RegisterDto } from '@auth/dto/register.dto';
import { Tokens } from '@auth/interfaces';
import { Cookie, Public, UserAgent } from '@common/decorators';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@users/entities/user.entity';
import { Response } from 'express';
import { AuthService } from './auth.service';

const REFRESH_TOKEN = 'refreshToken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);

    if (!user) {
      throw new BadRequestException(`Fail register user with data ${JSON.stringify(registerDto)}`);
    }

    return new UserEntity(user);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() response: Response, @UserAgent() agent: string) {
    const tokens = await this.authService.login(loginDto, agent);

    if (!tokens) {
      throw new BadRequestException(`Fail login with data ${JSON.stringify(loginDto)}`);
    }

    this.setRefreshTokenToCookies(tokens, response);
  }

  @Public()
  @Get('refresh-tokens')
  async refreshTokens(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() response: Response,
    @UserAgent() agent: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const tokens = await this.authService.refreshToken(refreshToken, agent);

    if (!tokens) {
      throw new BadRequestException(`Fail refresh token.`);
    }

    this.setRefreshTokenToCookies(tokens, response);
  }

  @Get('logout')
  async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() response: Response) {
    if (!refreshToken) {
      response.sendStatus(HttpStatus.OK);

      return;
    }

    await this.authService.deleteRefreshToken(refreshToken);
    response.cookie(REFRESH_TOKEN, '', { httpOnly: true, expires: new Date() });
    response.sendStatus(HttpStatus.OK);
  }

  private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }

    const { token, exp } = tokens.refreshToken;

    res.cookie(REFRESH_TOKEN, token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(exp),
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
  }
}
