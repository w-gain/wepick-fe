import { useQuery } from '@tanstack/react-query';

import { dataMode } from '../../app/enableMocking';
import type { MemberProfile } from '../../shared/contracts';
import { memberProfileSchema } from '../../shared/contracts';
import { apiRequest } from '../../shared/api/client';

export function useMemberProfile() {
  return useQuery({
    queryKey: ['member-profile'],
    queryFn: () =>
      apiRequest<MemberProfile>(
        dataMode === 'mock' || import.meta.env.MODE === 'test'
          ? '/__mock/members/me'
          : '/members/me',
        { method: 'GET', schema: memberProfileSchema },
      ),
  });
}
