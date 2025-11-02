import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      success: false, // Konsisten dengan success response
      statusCode: status,
      message:
        typeof message === 'string'
          ? message
          : Array.isArray((message as unknown as { message: string[] }).message)
            ? (message as unknown as { message: string[] }).message.join(', ')
            : (message as unknown as { message: string }).message ||
              (message as unknown as { error: string }).error ||
              'An error occurred',
      error:
        typeof message === 'object' &&
        !Array.isArray((message as unknown as { message: string[] }).message)
          ? (message as unknown as { error: string }).error
          : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
