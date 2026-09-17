import type { ZodType } from 'zod';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API request failed with status ${status}.`);
    this.name = 'ApiError';
  }
}

type ApiRequestOptions<T> = RequestInit & {
  schema: ZodType<T>;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions<T>): Promise<T> {
  const { schema, ...init } = options;
  const headers = new Headers(init.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return schema.parse(body);
}
