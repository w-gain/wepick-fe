import { describe, expect, it } from 'vitest';

import { todayPickBeforeVote } from '../../mocks/fixtures';
import { pickResponseAdapter } from './responseAdapters';

describe('pick response adapter', () => {
  it('returns the screen model for a valid response', () => {
    expect(pickResponseAdapter.fromResponse(todayPickBeforeVote)).toEqual(todayPickBeforeVote);
  });

  it('rejects a response that does not satisfy the screen contract', () => {
    expect(() =>
      pickResponseAdapter.fromResponse({
        ...todayPickBeforeVote,
        representativeDate: '09/17/2026',
      }),
    ).toThrow();
  });
});
