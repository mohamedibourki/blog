import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsMongoId,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  views?: number;

  @IsNumber()
  @IsOptional()
  likes?: number;

  @IsMongoId()
  @IsNotEmpty()
  authorId: string;
}
