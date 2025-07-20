import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User as PrismaUser } from 'generated/prisma';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<PrismaUser> {
    const hashedPassword = await argon2.hash(createUserDto.password);

    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      },
    });
  }

  findAll(): Promise<PrismaUser[]> {
    return this.prisma.user.findMany();
  }

  async findOne(username: string): Promise<PrismaUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async update(
    username: string,
    updateUserDto: UpdateUserDto,
  ): Promise<PrismaUser> {
    const data: {
      email?: string | undefined;
      username?: string | undefined;
      password?: string;
    } = {
      ...(updateUserDto.username && { username: updateUserDto.username }),
      ...(updateUserDto.email && { email: updateUserDto.email }),
    };

    if (updateUserDto.password)
      data.password = await argon2.hash(updateUserDto.password);

    return this.prisma.user.update({
      where: {
        username,
      },
      data,
    });
  }

  remove(username: string): Promise<PrismaUser> {
    return this.prisma.user.delete({
      where: {
        username,
      },
    });
  }
}
