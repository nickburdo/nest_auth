import { JwtPayload } from '@auth/interfaces';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { genSaltSync, hashSync } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    const { password, roles, ...rest } = createUserDto;
    return this.prisma.user.create({
      data: {
        password: this.hashPassword(password),
        roles: roles || [Role.USER],
        ...rest,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(idOrEmail: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ id: idOrEmail }, { email: idOrEmail }] },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = this.hashPassword(updateUserDto.password);
    }

    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: string, currentUser: JwtPayload) {
    if (currentUser.id !== id || !currentUser.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException();
    }

    return this.prisma.user.delete({ where: { id } });
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
