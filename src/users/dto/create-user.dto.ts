export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class CreateUserDto {
  name?: string;
  email: string;
  password: string;
  roles: UserRole[];
}
