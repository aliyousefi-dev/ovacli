export interface ApiSuccessResponse<T> {
  data: T;
  message: string;
  status: string;
}

export interface ApiErrorResponse {
  status: string; // "error"
  error: {
    code: number; // HTTP status code
    message: string; // e.g., "Server error occurred"
    data?: any; // Optional additional error details
  };
}
