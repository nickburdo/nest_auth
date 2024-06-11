import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { RegisterDto } from '@auth/dto/register.dto';

@ValidatorConstraint({ name: 'IsPasswordsMatch', async: false })
export class IsPasswordsMatch implements ValidatorConstraintInterface {
  validate(passwordConfirm: string, args: ValidationArguments): Promise<boolean> | boolean {
    const obj = args.object as RegisterDto;

    return obj.password === passwordConfirm;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Password mismatch';
  }
}
