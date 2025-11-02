import { UserRole } from 'src/users/enums/role.enum';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
