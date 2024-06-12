import { JwtPayload } from '@auth/interfaces';
import { convertToSeconds } from '@common/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UserEntity } from '@users/entities/user.entity';
import { genSaltSync, hashSync } from 'bcrypt';
import { Cache } from 'cache-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}
  create(createUserDto: CreateUserDto) {
    const { password, roles, ...rest } = createUserDto;
    return this.prisma.user.create({
      data: {
        password: password ? this.hashPassword(password) : null,
        roles: roles || [Role.USER],
        ...rest,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(idOrEmail: string, reset = false) {
    if (reset) {
      await this.cacheManager.del(idOrEmail);
    }

    let user = await this.cacheManager.get<UserEntity>(idOrEmail);

    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { OR: [{ id: idOrEmail }, { email: idOrEmail }] },
      });
      if (!user) {
        return null;
      }
      await this.cacheManager.set(idOrEmail, user, convertToSeconds(this.configService.get('TTL')) * 1000);
    }

    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = this.hashPassword(updateUserDto.password);
    }

    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async remove(id: string, currentUser: JwtPayload) {
    if (currentUser.id !== id || !currentUser.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException();
    }
    await Promise.all([this.cacheManager.del(id), this.cacheManager.del(currentUser.email)]);

    return this.prisma.user.delete({ where: { id } });
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
