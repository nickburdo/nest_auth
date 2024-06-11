import { IsPasswordsMatch } from '@common/decorators';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Validate } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsPasswordsMatch)
  passwordConfirm: string;

  @IsOptional()
  @IsString()
  name?: string;
}
