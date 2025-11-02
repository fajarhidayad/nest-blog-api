import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/role.enum';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, TokenResponse } from './types/jwt-payload.type';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await argon.hash(password, {
      type: argon.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }

  private async verifyPassword(
    hash: string,
    password: string,
  ): Promise<boolean> {
    try {
      return await argon.verify(hash, password);
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  private async generateToken(user: User): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshTokenSecret'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await this.hashPassword(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async register(
    registerDto: RegisterDto,
    role?: UserRole,
  ): Promise<TokenResponse> {
    const { name, email, password } = registerDto;

    const checkEmail = await this.usersService.findOneByEmail(email);
    if (checkEmail) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    if (!role || role === UserRole.ADMIN) {
      role = UserRole.READER;
    }

    const user = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const tokens = await this.generateToken(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const { email, password } = loginDto;

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateToken(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.refreshToken) {
      await this.usersService.update(userId, {
        refreshToken: null,
      });
      return;
    }

    throw new ForbiddenException('access denied');
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<TokenResponse> {
    const user = await this.usersService.findOneById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('access denied');
    }

    const isRefreshTokenValid = await this.verifyPassword(
      user.refreshToken,
      refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const tokens = await this.generateToken(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
