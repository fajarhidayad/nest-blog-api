import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }

  async create(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<boolean> {
    const user = await this.findOneById(id);

    if (!user) {
      return false;
    }

    await this.userRepository.save({
      ...user,
      ...userData,
      updatedAt: new Date(),
    });
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.findOneById(id);

    if (!user) {
      return false;
    }

    await this.userRepository.delete(id);
    return true;
  }
}
