import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment as CommentEntity } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async findByPostId(
    postId: string,
    page: number,
    limit: number,
  ): Promise<CommentEntity[]> {
    try {
      return this.commentRepository
        .createQueryBuilder('comments')
        .select([
          'comments.id',
          'comments.content',
          'comments.createdAt',
          'user.id',
          'user.name',
          'user.email',
        ])
        .leftJoin('comments.author', 'user')
        .where('comments.post_id = :postId', { postId })
        .orderBy('comments.createdAt', 'DESC')
        .take(limit)
        .skip((page - 1) * limit)
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
    postId: string,
  ): Promise<CommentEntity> {
    try {
      const comment = this.commentRepository.create({
        content: createCommentDto.content,
        author: { id: userId },
        post: { id: postId },
      });
      return this.commentRepository.save(comment);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this comment',
      );
    }
    comment.content = updateCommentDto.content;
    return this.commentRepository.save(comment);
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }
    await this.commentRepository.delete(id);
  }
}
