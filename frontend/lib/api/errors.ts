export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly requestId?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class NetworkError extends ApiClientError {
  constructor(message: string = 'Network error occurred') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

export class ServerError extends ApiClientError {
  constructor(message: string, status: number, requestId?: string) {
    super(message, status, requestId);
    this.name = 'ServerError';
  }
}

export class AuthError extends ApiClientError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'AuthError';
  }
}
