import { GUARDS } from '@auth/guards';
import { STRATEGIES } from '@auth/strategies';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { options } from './config';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.registerAsync(options()), HttpModule],
  controllers: [AuthController],
  providers: [AuthService, ...STRATEGIES, ...GUARDS],
})
export class AuthModule {}
