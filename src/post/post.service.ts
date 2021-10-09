import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CategoryService } from '../category/category.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly repo: Repository<Post>,
    private catService: CategoryService,
  ) {}

  async create(createPostDto: CreatePostDto, user: User) {
    const post = new Post();
    post.userId = user.id;
    Object.assign(post, createPostDto);

    this.repo.create(post);
    return await this.repo.save(post);
  }

  async findAll(query?: string) {
    const myQuery = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.user', 'user');

    // check if query is present
    if (!(Object.keys(query).length === 0) && query.constructor === Object) {
      const queryKeys = Object.keys(query); // get the keys of the query string

      // check if slug key is present
      if (queryKeys.includes('slug')) {
        myQuery.where('post.slug LIKE :slug', { slug: `%${query['slug']}%` });
      }
      // check if sort key is present, we will sort by Title field only
      if (queryKeys.includes('sort')) {
        myQuery.orderBy('post.title', query['sort'].toUpperCase());
      }

      // check if category is present, show only selected category items
      if (queryKeys.includes('category')) {
        myQuery.andWhere('category.title = :cat', { cat: query['category'] });
      }

      return await myQuery.getMany();
    } else {
      return await myQuery.getMany();
    }
  }

  async findOne(id: number) {
    try {
      const post = await this.repo.findOneOrFail(id);
      return post;
    } catch (err) {
      throw new BadRequestException('Post not found');
    }
  }

  async findBySlug(slug: string) {
    try {
      const post = await this.repo.findOne({ slug });
      return post;
    } catch (err) {
      throw new BadRequestException(`Post with slug ${slug} not found`);
    }
  }

  async update(slug: string, updatePostDto: UpdatePostDto) {
    const post = await this.repo.findOne({ slug });

    if (!post) {
      throw new BadRequestException('post not found');
    }

    post.modifiedOn = new Date(Date.now());
    post.category = updatePostDto.category;
    Object.assign(post, updatePostDto);
    return this.repo.save(post);
  }

  async remove(id: number) {
    const post = await this.repo.findOne(id);
    await this.repo.remove(post);
    return { success: true, post };
  }
}
