import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class AppFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest<Request>();
    const err = res.error;
    console.log('Filter');
    if (!res.statusCode) return;
    if (exception instanceof HttpException) {
      const message = Object(exception.getResponse()).message;
      const status = exception.getStatus();
      res.json({
        statusCode: status,
        errors: message,
        timestamp: new Date().toISOString(),
        path: req.url,
      });
    }
  }
}
