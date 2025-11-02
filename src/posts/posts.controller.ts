import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UserRole } from 'src/users/enums/role.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';

@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  @Public()
  async findAll() {
    return this.postsService.findAll();
  }

  @Get('category/:categoryId')
  @Public()
  async findByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return this.postsService.findByCategory(categoryId);
  }

  @Get('author/:authorId')
  @Public()
  async findByAuthor(@Param('authorId', ParseUUIDPipe) authorId: string) {
    return this.postsService.findByAuthor(authorId);
  }

  @Get('publishedAt/:publishedAt')
  @Public()
  async findByPublishedAt(@Param('publishedAt') publishedAt: Date) {
    return this.postsService.findByPublishedAt(publishedAt);
  }

  @Get('slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get('search')
  @Public()
  async findBySearch(@Query('q') search: string) {
    return this.postsService.findBySearch(search);
  }

  @Post()
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @UseGuards(RolesGuard, AccessTokenGuard)
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.postsService.create(createPostDto, userId);
  }

  @Get(':id/comments')
  @Public()
  async findComments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 10;
    return this.commentsService.findByPostId(id, page, limit);
  }

  @Post(':id/comments')
  @Roles(UserRole.READER, UserRole.AUTHOR, UserRole.ADMIN)
  @UseGuards(RolesGuard, AccessTokenGuard)
  async createComment(
    @Param('id', ParseUUIDPipe) postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetCurrentUserId() userId: string,
  ) {
    const post = await this.postsService.findOne(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.commentsService.create(createCommentDto, userId, postId);
  }

  @Put(':postId/comments/:commentId')
  @Roles(UserRole.READER, UserRole.AUTHOR, UserRole.ADMIN)
  @UseGuards(RolesGuard, AccessTokenGuard)
  async updateComment(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetCurrentUserId() userId: string,
  ) {
    const post = await this.postsService.findOne(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.commentsService.update(commentId, updateCommentDto, userId);
  }

  @Delete(':postId/comments/:commentId')
  @Roles(UserRole.READER, UserRole.AUTHOR, UserRole.ADMIN)
  @UseGuards(RolesGuard, AccessTokenGuard)
  async deleteComment(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @GetCurrentUserId() userId: string,
  ) {
    const post = await this.postsService.findOne(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.commentsService.delete(commentId, userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @UseGuards(RolesGuard, AccessTokenGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: CreatePostDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.postsService.update(id, updatePostDto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @UseGuards(RolesGuard, AccessTokenGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.delete(id);
  }
}
