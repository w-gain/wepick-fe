import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { dataMode } from '../../app/enableMocking';
import type { Choice, OpinionList, Pick, PickList, VoteHistory } from '../../shared/contracts';
import { ApiError, apiRequest } from '../../shared/api/client';
import { apiDataResponseAdapter } from '../../shared/api/responseAdapter';
import { useAuthFlow } from '../auth/authFlow';
import { currentTopicResponseAdapter } from './currentTopicAdapter';
import { getTopicArchivePage, type ArchiveTopicItem } from './topicArchiveAdapter';
import {
  opinionListResponseAdapter,
  pickListResponseAdapter,
  pickResponseAdapter,
  voteHistoryResponseAdapter,
} from './responseAdapters';

const useMockApi = dataMode === 'mock' || import.meta.env.MODE === 'test';

function pickPath(pickId?: string) {
  return pickId ? `/__mock/picks/${pickId}` : '/__mock/picks/today';
}

export function getCurrentTopic() {
  return apiRequest<Pick>('/topics/today', {
    method: 'GET',
    responseAdapter: currentTopicResponseAdapter,
  });
}

export class VoteResultRefreshError extends Error {
  constructor() {
    super('The vote was recorded, but the current topic could not be refreshed.');
    this.name = 'VoteResultRefreshError';
  }
}

export class VoteSessionRequiredError extends Error {
  constructor() {
    super('The current backend requires a member session to vote.');
    this.name = 'VoteSessionRequiredError';
  }
}

export class VoteAlreadyRecordedError extends Error {
  constructor(public readonly pick: Pick) {
    super('The member already voted on this topic.');
    this.name = 'VoteAlreadyRecordedError';
  }
}

export async function submitCurrentTopicVote(pick: Pick, choice: Choice) {
  const topicId = Number(pick.id);
  const optionId = pick.options.find((option) => option.choice === choice)?.id;
  if (
    !Number.isSafeInteger(topicId) ||
    topicId <= 0 ||
    optionId == null ||
    !Number.isSafeInteger(optionId) ||
    optionId <= 0
  ) {
    throw new Error('The current topic is missing a valid topic or option ID.');
  }

  try {
    await apiRequest(`/topics/${topicId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId }),
      responseAdapter: apiDataResponseAdapter(z.null()),
    });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 409)) throw error;
    let existing: Pick;
    try {
      existing = await getCurrentTopic();
    } catch {
      throw new VoteResultRefreshError();
    }
    if (existing.id !== pick.id || !existing.userVote) throw error;
    throw new VoteAlreadyRecordedError(existing);
  }

  try {
    const updated = await getCurrentTopic();
    if (updated.id !== pick.id || updated.userVote !== choice) {
      throw new Error('The refreshed topic does not contain the recorded vote.');
    }
    return updated;
  } catch {
    throw new VoteResultRefreshError();
  }
}

export type PastPicksItem = { source: 'mock'; pick: PickList['items'][number] } | ArchiveTopicItem;

export type PastPicksPage = { items: PastPicksItem[]; nextCursor: string | null };

export async function getPastPicksPage(cursor: string | null): Promise<PastPicksPage> {
  if (!useMockApi) return getTopicArchivePage(cursor === null ? 0 : Number(cursor));

  const list = await apiRequest<PickList>(
    cursor ? `/__mock/picks?cursor=${encodeURIComponent(cursor)}` : '/__mock/picks',
    { method: 'GET', responseAdapter: pickListResponseAdapter },
  );
  return {
    items: list.items.map((pick) => ({ source: 'mock', pick })),
    nextCursor: list.nextCursor,
  };
}

export function usePastPicks() {
  return useInfiniteQuery({
    queryKey: ['picks'],
    queryFn: ({ pageParam }) => getPastPicksPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useVoteHistory() {
  const { status } = useAuthFlow();
  return useQuery({
    queryKey: ['vote-history'],
    enabled: useMockApi && status === 'authenticated',
    queryFn: () =>
      apiRequest<VoteHistory>('/__mock/members/me/votes', {
        method: 'GET',
        responseAdapter: voteHistoryResponseAdapter,
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
    queryFn: () => {
      if (useMockApi) {
        return apiRequest<Pick>(pickPath(pickId), {
          method: 'GET',
          responseAdapter: pickResponseAdapter,
        });
      }
      if (pickId) {
        throw new Error('The current backend does not provide a Pick detail endpoint.');
      }
      return getCurrentTopic();
    },
  });
}

export function useOpinions(pickId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['pick-opinions', pickId],
    enabled: enabled && useMockApi,
    queryFn: () =>
      apiRequest<OpinionList>(opinionsPath(pickId), {
        method: 'GET',
        responseAdapter: opinionListResponseAdapter,
      }),
  });
}

export function useVote(pick: Pick | undefined) {
  const queryClient = useQueryClient();
  const { status, setStatus } = useAuthFlow();

  return useMutation({
    mutationFn: async (choice: Choice) => {
      if (!pick) throw new Error('A topic is required before voting.');
      if (useMockApi) {
        return apiRequest<Pick>(votePath(pick.id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice }),
          responseAdapter: pickResponseAdapter,
        });
      }
      if (status !== 'authenticated') throw new VoteSessionRequiredError();
      try {
        return await submitCurrentTopicVote(pick, choice);
      } catch (error) {
        if (error instanceof VoteAlreadyRecordedError) {
          queryClient.setQueryData(['pick', pick.id], error.pick);
          queryClient.setQueryData(['pick', 'today'], error.pick);
          throw error;
        }
        if (error instanceof ApiError && error.status === 401) {
          setStatus('anonymous');
          throw new VoteSessionRequiredError();
        }
        throw error;
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['pick', updated.id], updated);
      const today = queryClient.getQueryData<Pick>(['pick', 'today']);
      if (!useMockApi || today?.id === updated.id) {
        queryClient.setQueryData(['pick', 'today'], updated);
      }
    },
  });
}
