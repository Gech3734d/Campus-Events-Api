import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {

    const startTime = Date.now();

    console.log('Before: Request started');

    return next.handle().pipe(
      tap(() => {
        console.log('After: Request completed');
        console.log(
          `Time: ${Date.now() - startTime}ms`,
        );
      }),
    );
  }
}