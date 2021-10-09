import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import slugify from 'slugify';
import { User } from '../../auth/entities/user.entity';
import { Exclude } from 'class-transformer';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  slug: string;

  @Column({ default: 3 })
  @Exclude()
  categoryId: number;

  @Column()
  @Exclude()
  userId: number;

  @ManyToOne(() => Category, (cat) => cat.posts, { eager: true })
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'categoryId',
  })
  category: Category;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'userId',
  })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdOn: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  modifiedOn: Date;

  @Column({
    default:
      'https://i0.wp.com/clicxy.com/wp-content/uploads/2016/04/dummy-post-horisontal.jpg?ssl=1',
    nullable: true,
  })
  mainImageUrl: string;

  @BeforeInsert()
  slugifyPost() {
    this.slug = slugify(this.title.substr(0, 20), {
      replacement: '_',
      lower: true,
    });
  }
}
