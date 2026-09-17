import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { handlers } from './handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('mock scenarios', () => {
  it('keeps empty data distinct from a request failure', async () => {
    const emptyResponse = await fetch('http://localhost/api/__mock/picks?scenario=empty');
    const errorResponse = await fetch('http://localhost/api/__mock/picks?scenario=error');

    expect(emptyResponse.status).toBe(200);
    await expect(emptyResponse.json()).resolves.toEqual({ items: [], nextCursor: null });
    expect(errorResponse.status).toBe(503);
    await expect(errorResponse.json()).resolves.toMatchObject({ code: 'MOCK_TEMPORARY_ERROR' });
  });

  it('does not expose results before voting', async () => {
    const response = await fetch('http://localhost/api/__mock/picks/today');
    await expect(response.json()).resolves.toMatchObject({ userVote: null, result: null });
  });
});
