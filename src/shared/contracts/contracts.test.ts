import { describe, expect, it } from 'vitest';

import {
  emptyPickList,
  emptyVoteHistory,
  memberProfile,
  pastPicks,
  todayPickAfterVote,
  todayPickBeforeVote,
  voteHistory,
} from '../../mocks/fixtures';
import { memberProfileSchema, pickListSchema, pickSchema, voteHistorySchema } from '.';

describe('screen data contracts', () => {
  it('accepts every maintained mock fixture', () => {
    expect(pickSchema.parse(todayPickBeforeVote)).toEqual(todayPickBeforeVote);
    expect(pickSchema.parse(todayPickAfterVote)).toEqual(todayPickAfterVote);
    expect(pickListSchema.parse(pastPicks)).toEqual(pastPicks);
    expect(pickListSchema.parse(emptyPickList)).toEqual(emptyPickList);
    expect(memberProfileSchema.parse(memberProfile)).toEqual(memberProfile);
    expect(voteHistorySchema.parse(voteHistory)).toEqual(voteHistory);
    expect(voteHistorySchema.parse(emptyVoteHistory)).toEqual(emptyVoteHistory);
  });

  it('rejects results whose counts do not match the total', () => {
    const invalid = structuredClone(todayPickAfterVote);
    if (!invalid.result) throw new Error('Test fixture must have a result.');
    invalid.result.totalVotes += 1;

    expect(pickSchema.safeParse(invalid).success).toBe(false);
  });

  it('does not allow results before the user votes', () => {
    const invalid = { ...todayPickAfterVote, userVote: null };
    expect(pickSchema.safeParse(invalid).success).toBe(false);
  });
});
