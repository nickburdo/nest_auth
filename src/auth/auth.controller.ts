import { LoginDto } from '@auth/dto/login.dto';
import { RegisterDto } from '@auth/dto/register.dto';
import { GoogleGuard } from '@auth/guards/google.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { JwtPayload, Tokens } from '@auth/interfaces';
import { Cookie, CurrentUser, Public, Roles, UserAgent } from '@common/decorators';
import { handleTimeoutsAndErrors } from '@common/helpers';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { UserEntity } from '@users/entities/user.entity';
import { Request, Response } from 'express';
import { map, mergeMap } from 'rxjs';
import { AuthService } from './auth.service';

const REFRESH_TOKEN = 'refreshToken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly http: HttpService,
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

  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  @Get('current')
  current(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Public()
  @UseGuards(GoogleGuard)
  @Get('google')
  googleAuth() {}

  @Public()
  @UseGuards(GoogleGuard)
  @Get('google/callback')
  googleAuthCallback(@Req() request: Request, @Res() response: Response) {
    const token = request.user['accessToken'];
    return response.redirect(`http://localhost:5000/api/auth/success?token=${token}`);
  }

  @Public()
  @Get('success')
  success(@Query('token') token: string, @UserAgent() agent: string, @Res() response: Response) {
    return this.http.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`).pipe(
      mergeMap(({ data: { email } }) => this.authService.googleAuth(email, agent)),
      map((data) => this.setRefreshTokenToCookies(data, response)),
      handleTimeoutsAndErrors(),
    );
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
