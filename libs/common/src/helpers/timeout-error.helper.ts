import { HttpException, HttpStatus } from '@nestjs/common';
import { catchError, Observable, timeout, TimeoutError } from 'rxjs';

export function handleTimeoutsAndErrors<T = unknown>() {
  return (source$: Observable<T>) =>
    source$.pipe(
      timeout(500),
      catchError((err: Error) => {
        if (err instanceof TimeoutError) {
          throw new HttpException(err.message, HttpStatus.REQUEST_TIMEOUT);
        }
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }),
    );
}
