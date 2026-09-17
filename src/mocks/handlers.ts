import { delay, http, HttpResponse } from 'msw';

import {
  emptyPickList,
  emptyVoteHistory,
  memberProfile,
  pastPicks,
  todayPickAfterVote,
  todayPickBeforeVote,
  voteHistory,
} from './fixtures';

function scenario(request: Request) {
  return new URL(request.url).searchParams.get('scenario');
}

function failure() {
  return HttpResponse.json(
    { code: 'MOCK_TEMPORARY_ERROR', message: '잠시 후 다시 시도해 주세요.' },
    { status: 503 },
  );
}

export const handlers = [
  http.get('*/api/__mock/picks/today', async ({ request }) => {
    await delay(300);
    if (scenario(request) === 'error') return failure();
    return HttpResponse.json(
      scenario(request) === 'after-vote' ? todayPickAfterVote : todayPickBeforeVote,
    );
  }),
  http.get('*/api/__mock/picks', ({ request }) => {
    if (scenario(request) === 'error') return failure();
    return HttpResponse.json(scenario(request) === 'empty' ? emptyPickList : pastPicks);
  }),
  http.get('*/api/__mock/picks/:pickId', ({ request }) => {
    if (scenario(request) === 'error') return failure();
    return HttpResponse.json(todayPickAfterVote);
  }),
  http.get('*/api/__mock/picks/:pickId/opinions', ({ request }) => {
    if (scenario(request) === 'error') return failure();
    return HttpResponse.json(
      scenario(request) === 'empty'
        ? { items: [], nextCursor: null }
        : {
            items: Object.values(todayPickAfterVote.representativeOpinions).filter(Boolean),
            nextCursor: null,
          },
    );
  }),
  http.get('*/api/__mock/members/me', ({ request }) => {
    if (scenario(request) === 'error') return failure();
    return HttpResponse.json(memberProfile);
  }),
  http.get('*/api/__mock/members/me/votes', ({ request }) => {
    if (scenario(request) === 'error') return failure();
    return HttpResponse.json(scenario(request) === 'empty' ? emptyVoteHistory : voteHistory);
  }),
];
