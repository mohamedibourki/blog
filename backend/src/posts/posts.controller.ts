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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PrismaPost } from 'generated/prisma';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Roles('admin', 'author')
  @Post()
  @HttpCode(201)
  create(@Body() createPostDto: CreatePostDto): Promise<PrismaPost> {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll(): Promise<PrismaPost[]> {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PrismaPost> {
    return this.postsService.findOne(id);
  }

  @Roles('admin', 'author')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PrismaPost> {
    return this.postsService.update(id, updatePostDto);
  }

  @Roles('admin', 'author')
  @Delete(':id')
  remove(@Param('id') id: string): Promise<PrismaPost> {
    return this.postsService.remove(id);
  }
}
