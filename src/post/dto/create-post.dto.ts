import { Category } from './../../category/entities/category.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  categoryId: number;

  @IsString()
  mainImageUrl: string;

  @IsOptional()
  category: Category;
}
