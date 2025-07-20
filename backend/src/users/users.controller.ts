import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as PrismaUser } from 'generated/prisma';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createUserDto: CreateUserDto): Promise<PrismaUser> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<PrismaUser[]> {
    return this.usersService.findAll();
  }

  @Get(':username')
  findOne(@Param('username') username: string): Promise<PrismaUser> {
    return this.usersService.findOne(username);
  }

  @Patch(':username')
  update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<PrismaUser> {
    return this.usersService.update(username, updateUserDto);
  }

  @Delete(':username')
  remove(@Param('username') username: string): Promise<PrismaUser> {
    return this.usersService.remove(username);
  }
}
