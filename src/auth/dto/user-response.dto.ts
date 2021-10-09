import { Expose } from 'class-transformer';
import { Post } from '../../post/entities/post.entity';

export class UserResponseDto {
  @Expose()
  id: number;
  @Expose()
  firstname: string;
  @Expose()
  lastname: string;
  @Expose()
  email: string;
  @Expose()
  posts: Post[]
}
