import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { dataMode } from '../../app/enableMocking';
import type { Choice, OpinionList, Pick, PickList, VoteHistory } from '../../shared/contracts';
import {
  opinionListSchema,
  pickListSchema,
  pickSchema,
  voteHistorySchema,
} from '../../shared/contracts';
import { apiRequest } from '../../shared/api/client';

const useMockApi = dataMode === 'mock' || import.meta.env.MODE === 'test';

function pickPath(pickId?: string) {
  if (useMockApi) return pickId ? `/__mock/picks/${pickId}` : '/__mock/picks/today';
  return pickId ? `/picks/${pickId}` : '/picks/today';
}

function picksPath() {
  return useMockApi ? '/__mock/picks' : '/picks';
}

export function usePastPicks() {
  return useQuery({
    queryKey: ['picks'],
    queryFn: () =>
      apiRequest<PickList>(picksPath(), {
        method: 'GET',
        schema: pickListSchema,
      }),
  });
}

export function useVoteHistory() {
  return useQuery({
    queryKey: ['vote-history'],
    queryFn: () =>
      apiRequest<VoteHistory>(useMockApi ? '/__mock/members/me/votes' : '/members/me/votes', {
        method: 'GET',
        schema: voteHistorySchema,
      }),
  });
}

function opinionsPath(pickId: string) {
  return useMockApi ? `/__mock/picks/${pickId}/opinions` : `/picks/${pickId}/opinions`;
}

function votePath(pickId: string) {
  return useMockApi ? `/__mock/picks/${pickId}/votes` : `/picks/${pickId}/votes`;
}

export function usePick(pickId?: string) {
  return useQuery({
    queryKey: ['pick', pickId ?? 'today'],
    queryFn: () => apiRequest<Pick>(pickPath(pickId), { method: 'GET', schema: pickSchema }),
  });
}

export function useOpinions(pickId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['pick-opinions', pickId],
    enabled,
    queryFn: () =>
      apiRequest<OpinionList>(opinionsPath(pickId), {
        method: 'GET',
        schema: opinionListSchema,
      }),
  });
}

export function useVote(pickId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (choice: Choice) =>
      apiRequest<Pick>(votePath(pickId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
        schema: pickSchema,
      }),
    onSuccess: (pick) => {
      queryClient.setQueryData(['pick', pickId], pick);
      if (pickId === 'pick-2026-09-17') {
        queryClient.setQueryData(['pick', 'today'], pick);
      }
    },
  });
}
