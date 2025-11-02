import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response as ExpressResponse } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const httpResponse = context.switchToHttp().getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data: T): ApiResponse<T> => {
        // Jika sudah dalam format yang diinginkan, return langsung
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          typeof (data as unknown as { success: boolean }).success === 'boolean'
        ) {
          return data as unknown as ApiResponse<T>;
        }

        // Format response standar
        return {
          success: true,
          data: data,
          message: this.getMessage(context, httpResponse.statusCode),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getMessage(context: ExecutionContext, statusCode: number): string {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Pesan berdasarkan HTTP method
    switch (method) {
      case 'GET':
        return 'Data retrieved successfully';
      case 'POST':
        return statusCode === 201
          ? 'Resource created successfully'
          : 'Request processed successfully';
      case 'PUT':
      case 'PATCH':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      default:
        return 'Request processed successfully';
    }
  }
}
