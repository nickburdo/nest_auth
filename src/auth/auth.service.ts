import { LoginDto } from '@auth/dto/login.dto';
import { RegisterDto } from '@auth/dto/register.dto';
import { Tokens } from '@auth/interfaces';
import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, Token } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UserEntity } from '@users/entities/user.entity';
import { UsersService } from '@users/users.service';
import { compare } from 'bcrypt';
import { add } from 'date-fns';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const { name, email, password } = dto;
    const user = await this.userService.findOne(email).catch((error) => this.handleError(error, this.logger));

    if (user) {
      throw new ConflictException(`User with email ${email} already registered`);
    }

    return this.userService
      .create({ name, email, password, roles: [Role.USER] })
      .catch((error) => this.handleError(error, this.logger));
  }

  async login(dto: LoginDto, agent: string): Promise<Tokens> {
    const user = await this.userService.findOne(dto.email, true).catch((error) => this.handleError(error, this.logger));
    const isPasswordValid = compare(dto.password, user?.password);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Wrong email or password');
    }

    return this.generateTokens(user, agent);
  }

  async refreshToken(refreshToken: string, agent: string): Promise<Tokens> {
    const token = await this.prisma.token.findUnique({ where: { token: refreshToken } });

    if (!token) {
      throw new UnauthorizedException();
    }

    await this.prisma.token.delete({ where: { token: refreshToken } });

    if (new Date(token.exp) < new Date()) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne(token.userId);

    return this.generateTokens(user, agent);
  }

  async deleteRefreshToken(token: string) {
    return this.prisma.token.delete({ where: { token: token } }).catch((error) => this.handleError(error, this.logger));
  }

  private async getRefreshToken(userId: string, agent: string): Promise<Token> {
    const token = await this.prisma.token.findFirst({ where: { userId, userAgent: agent } });

    return this.prisma.token.upsert({
      where: { token: token?.token ?? '' },
      update: {
        token: uuid(),
        exp: add(new Date(), { months: 1 }),
      },
      create: {
        token: uuid(),
        exp: add(new Date(), { months: 1 }),
        userId,
        userAgent: agent,
      },
    });
  }

  private handleError(error: Error, logger: Logger) {
    logger.error(error);

    return null;
  }

  private async generateTokens(user: UserEntity, agent: string): Promise<Tokens> {
    const { id, email, roles } = user;
    const accessToken = 'Bearer ' + this.jwtService.sign({ id, email, roles });
    const refreshToken = await this.getRefreshToken(id, agent);

    return { accessToken, refreshToken };
  }
}
