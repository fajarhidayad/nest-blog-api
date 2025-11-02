import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findOne(id: string): Promise<Category | null> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findOneWithPosts(id: string): Promise<Category | null> {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.posts', 'posts')
      .where('category.id = :id', { id })
      .getOne();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findOneWithPostsBySlug(slug: string): Promise<Category | null> {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.posts', 'posts')
      .where('category.slug = :slug', { slug })
      .getOne();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findOneBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { slug } });
  }

  async findOneByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { name } });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.findOneBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const nameExists = await this.findOneByName(createCategoryDto.name);
    if (nameExists) {
      throw new ConflictException('Category already exists');
    }

    const slug = this.generateSlug(createCategoryDto.name);
    const uniqueSlug = await this.ensureUniqueSlug(slug);

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug: uniqueSlug,
    });
    return this.categoryRepository.save(category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const baseSlug = this.generateSlug(updateCategoryDto.name);
      const uniqueSlug = await this.ensureUniqueSlug(baseSlug);
      category.slug = uniqueSlug;
    }

    return this.categoryRepository.save({
      ...category,
      ...updateCategoryDto,
    });
  }

  async delete(id: string): Promise<void> {
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.categoryRepository.delete(id);
  }
}
