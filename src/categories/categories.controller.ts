import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('slug/:slug')
  @Public()
  async findOneBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findOneBySlug(slug);
  }

  @Get('slug/:slug/posts')
  @Public()
  async findOneWithPostsBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findOneWithPostsBySlug(slug);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/posts')
  @Public()
  async findOneWithPosts(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOneWithPosts(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, AccessTokenGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, AccessTokenGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, AccessTokenGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.delete(id);
  }
}
