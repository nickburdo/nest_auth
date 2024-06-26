import { AuthProvider, Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }

  id: string;
  email: string;

  @Exclude()
  password: string;
  @Exclude()
  provider: AuthProvider;

  name: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}
