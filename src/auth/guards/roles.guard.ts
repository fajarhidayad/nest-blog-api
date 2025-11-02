import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/users/enums/role.enum';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ambil required roles dari metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Jika tidak ada required roles, berarti route ini tidak memerlukan role tertentu
    if (!requiredRoles) {
      return true;
    }

    // Ambil user dari request
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload | null }>();
    const user = request.user;

    // Jika tidak ada user, berarti belum login
    if (!user) {
      return false;
    }

    // Cek apakah user memiliki salah satu dari required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
