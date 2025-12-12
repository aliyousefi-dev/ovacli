// error-handler.ts
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from './core-response';

export function handleApiError(error: HttpErrorResponse): ApiErrorResponse {
  return {
    status: 'error',
    error: {
      code: error.status,
      message:
        error.status === 0
          ? 'Cannot connect to the server. Please try again later.'
          : error.error?.message ||
            'An error occurred. Please try again later.',
    },
  };
}
