// error-handler.ts
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from './core-response';

export function handleApiError(error: HttpErrorResponse): ApiErrorResponse {
  return {
    status: 'error',
    error: {
      code: error.status,
      message:
        error.status === 500
          ? 'Server unavailable'
          : error.error?.error?.message || 'Uknown Error.',
    },
  };
}
