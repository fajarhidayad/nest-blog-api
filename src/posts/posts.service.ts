import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as PostEntity } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectDataSource() readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<PostEntity[]> {
    return this.postRepository
      .createQueryBuilder('posts')
      .select([
        'posts.id',
        'posts.title',
        'posts.slug',
        'posts.content',
        'posts.publishedAt',
        'posts.createdAt',
        'posts.updatedAt',
        'author.id',
        'author.name',
        'author.email',
        'category.id',
        'category.name',
      ])
      .leftJoin('posts.author', 'author')
      .leftJoin('posts.category', 'category')
      .getMany();
  }

  async findOne(id: string): Promise<PostEntity | null> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.comments', 'comments')
      .where('post.id = :id', { id })
      .getOne();
    return post;
  }

  async findByCategory(categoryId: string): Promise<PostEntity[]> {
    return this.postRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findByAuthor(authorId: string): Promise<PostEntity[]> {
    return this.postRepository.find({
      where: { author: { id: authorId } },
    });
  }

  async findByPublishedAt(publishedAt: Date): Promise<PostEntity[]> {
    return this.postRepository.find({
      where: { publishedAt },
    });
  }

  async findBySlug(slug: string): Promise<PostEntity | null> {
    const post = await this.postRepository.findOne({
      where: { slug },
    });
    return post;
  }

  async findBySearch(search: string): Promise<PostEntity[]> {
    if (!search) {
      return [];
    }
    return this.postRepository.find({
      where: { title: ILike(`%${search}%`) },
      relations: ['category', 'author', 'comments'],
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async create(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<PostEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const slug = this.generateSlug(createPostDto.title);
      const uniqueSlug = await this.ensureUniqueSlug(slug);

      const post = this.postRepository.create({
        ...createPostDto,
        slug: uniqueSlug,
        author: { id: userId },
        category: { id: createPostDto.categoryId },
      });

      const savedPost = await queryRunner.manager.save(PostEntity, post);

      await queryRunner.commitTransaction();
      return savedPost;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    updatePostDto: CreatePostDto,
    userId: string,
  ): Promise<PostEntity> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.postRepository.save({
      ...post,
      ...updatePostDto,
      author: { id: userId },
      category: { id: updatePostDto.categoryId },
    });
  }

  async delete(id: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.postRepository.delete(id);
  }
}
