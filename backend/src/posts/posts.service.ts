import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Post as PrismaPost } from 'generated/prisma';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto): Promise<PrismaPost> {
    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        image: createPostDto.image,
        views: createPostDto.views || 0,
        likes: createPostDto.likes || 0,
        authorId: createPostDto.authorId,
      },
      include: {
        author: true,
        comments: true,
      },
    });
  }

  findAll(): Promise<PrismaPost[]> {
    return this.prisma.post.findMany({
      include: {
        author: true,
        comments: true,
      },
    });
  }

  async findOne(id: string): Promise<PrismaPost> {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
        comments: true,
      },
    });

    if (!post) throw new NotFoundException('post not found');

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<PrismaPost> {
    const data: {
      title?: string;
      content?: string;
      image?: string;
      views?: number;
      likes?: number;
      authorId?: string;
    } = {
      ...(updatePostDto.title && { title: updatePostDto.title }),
      ...(updatePostDto.content && { content: updatePostDto.content }),
      ...(updatePostDto.image && { image: updatePostDto.image }),
      ...(updatePostDto.views !== undefined && { views: updatePostDto.views }),
      ...(updatePostDto.likes !== undefined && { likes: updatePostDto.likes }),
      ...(updatePostDto.authorId && { authorId: updatePostDto.authorId }),
    };

    return this.prisma.post.update({
      where: {
        id,
      },
      data,
      include: {
        author: true,
        comments: true,
      },
    });
  }

  remove(id: string): Promise<PrismaPost> {
    return this.prisma.post.delete({
      where: {
        id,
      },
      include: {
        author: true,
        comments: true,
      },
    });
  }
}
