import type { MemberProfile, Opinion, Pick, PickList, VoteHistory } from '../shared/contracts';

const cloudProfile = {
  id: 'member-cloud',
  nickname: '말랑구름',
  profileImage: { kind: 'default' as const, key: 'lavender-cloud' },
};

const opinions: Record<'A' | 'B', Opinion> = {
  A: {
    id: 'opinion-a',
    choice: 'A',
    body: '계획이 있으면 여행지에서 마음이 더 편해요.',
    author: cloudProfile,
    createdAt: '2026-09-17T02:15:00.000Z',
    edited: false,
    likedByMe: false,
    likeCount: 12,
    ownedByMe: true,
  },
  B: {
    id: 'opinion-b',
    choice: 'B',
    body: '그날 기분에 따라 움직일 때 예상 못 한 재미가 생겨요.',
    author: {
      id: 'member-breeze',
      nickname: '산들바람',
      profileImage: { kind: 'default', key: 'mint-breeze' },
    },
    createdAt: '2026-09-17T03:20:00.000Z',
    edited: true,
    likedByMe: true,
    likeCount: 27,
    ownedByMe: false,
  },
};

const basePick = {
  id: 'pick-2026-09-17',
  question: '여행은 계획대로 vs 발길 닿는 대로?',
  category: { id: 'daily', label: '취향·일상' },
  representativeDate: '2026-09-17',
  options: [
    { id: null, choice: 'A', label: '꼼꼼하게 계획대로', imageUrl: null },
    { id: null, choice: 'B', label: '발길 닿는 대로', imageUrl: null },
  ] satisfies Pick['options'],
};

export const todayPickBeforeVote: Pick = {
  ...basePick,
  opinionsAvailable: true,
  userVote: null,
  result: null,
  representativeOpinions: { A: null, B: null },
};

export const todayPickAfterVote: Pick = {
  ...basePick,
  opinionsAvailable: true,
  userVote: 'A',
  result: {
    totalVotes: 1248,
    options: {
      A: { count: 711, percent: 57 },
      B: { count: 537, percent: 43 },
    },
  },
  representativeOpinions: opinions,
};

export const pastPickBeforeVote: Pick = {
  ...todayPickBeforeVote,
  id: 'pick-2026-09-16',
  question: '쉬는 날엔 집콕 vs 외출?',
  representativeDate: '2026-09-16',
};

export const pastPickUnvoted: Pick = {
  ...todayPickBeforeVote,
  id: 'pick-2026-09-15',
  question: '아침형 인간 vs 저녁형 인간?',
  representativeDate: '2026-09-15',
};

export const pastPickUnvotedAfterVote: Pick = {
  ...pastPickUnvoted,
  userVote: 'A',
  result: todayPickAfterVote.result,
  representativeOpinions: todayPickAfterVote.representativeOpinions,
};

export const pastPickAfterVote: Pick = {
  ...todayPickAfterVote,
  ...pastPickBeforeVote,
  userVote: 'B',
  result: todayPickAfterVote.result,
  representativeOpinions: todayPickAfterVote.representativeOpinions,
};

function pickSummary(pick: Pick, userVote: Pick['userVote']): PickList['items'][number] {
  return {
    id: pick.id,
    question: pick.question,
    category: pick.category,
    representativeDate: pick.representativeDate,
    options: pick.options,
    userVote,
  };
}

export const pastPicks: PickList = {
  items: [
    pickSummary(todayPickBeforeVote, 'A'),
    pickSummary(pastPickBeforeVote, 'B'),
    pickSummary(pastPickUnvoted, null),
  ],
  nextCursor: null,
};

export const emptyPickList: PickList = { items: [], nextCursor: null };

export const memberProfile: MemberProfile = {
  ...cloudProfile,
};

export const voteHistory: VoteHistory = {
  items: pastPicks.items.flatMap((pick, index) =>
    pick.userVote
      ? [
          {
            id: `vote-${index + 1}`,
            pick,
            choice: pick.userVote,
            votedAt: `${pick.representativeDate}T12:00:00.000Z`,
          },
        ]
      : [],
  ),
  nextCursor: null,
};

export const emptyVoteHistory: VoteHistory = { items: [], nextCursor: null };
