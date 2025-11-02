import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDate()
  @IsOptional()
  publishedAt?: Date;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
