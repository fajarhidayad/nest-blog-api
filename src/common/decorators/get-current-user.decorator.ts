import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { JwtPayloadWithRefreshToken } from 'src/auth/types/jwt-payload.type';

export const GetCurrentUser = createParamDecorator(
  (
    data: keyof JwtPayloadWithRefreshToken | undefined,
    context: ExecutionContext,
  ) => {
    const request = context.switchToHttp().getRequest<Request>();
    if (!data) {
      return request.user as User;
    }
    return request.user?.[data] as JwtPayloadWithRefreshToken[typeof data];
  },
);
