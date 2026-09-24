import { z } from 'zod';

import { apiRequest, ApiError } from '../../shared/api/client';
import { apiDataResponseAdapter } from '../../shared/api/responseAdapter';
import type { AuthStatus } from './authFlow';

export const currentUserDtoSchema = z.object({
  userId: z.number().int().positive(),
  email: z.email(),
  profileImageUrl: z.string().nullable(),
  nickname: z.string().min(1),
});

export type CurrentUserDto = z.infer<typeof currentUserDtoSchema>;

export const currentUserResponseAdapter = apiDataResponseAdapter(currentUserDtoSchema);

export function getCurrentUser() {
  return apiRequest<CurrentUserDto>('/users/me', {
    method: 'GET',
    responseAdapter: currentUserResponseAdapter,
  });
}

export async function resolveCurrentSessionStatus(): Promise<AuthStatus> {
  try {
    await getCurrentUser();
    return 'authenticated';
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return 'anonymous';
    }
    throw error;
  }
}
