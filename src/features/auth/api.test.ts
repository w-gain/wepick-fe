import { afterEach, describe, expect, it, vi } from 'vitest';

import { currentUserResponseAdapter, resolveCurrentSessionStatus } from './api';

afterEach(() => vi.unstubAllGlobals());

describe('current user adapter', () => {
  it('extracts the current BE user DTO from its response envelope', () => {
    expect(
      currentUserResponseAdapter.fromResponse({
        message: 'get_user_success',
        data: {
          userId: 7,
          email: 'member@example.com',
          profileImageUrl: null,
          nickname: '말랑구름',
        },
        error: null,
      }),
    ).toEqual({
      userId: 7,
      email: 'member@example.com',
      profileImageUrl: null,
      nickname: '말랑구름',
    });
  });
});

describe('resolveCurrentSessionStatus', () => {
  it('returns authenticated when the current session endpoint succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'get_user_success',
            data: {
              userId: 7,
              email: 'member@example.com',
              profileImageUrl: null,
              nickname: '말랑구름',
            },
            error: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    await expect(resolveCurrentSessionStatus()).resolves.toBe('authenticated');
    expect(fetch).toHaveBeenCalledWith(
      '/api/users/me',
      expect.objectContaining({ credentials: 'include', method: 'GET' }),
    );
  });

  it.each([401, 403])('returns anonymous for an authentication response (%s)', async (status) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'unauthorized', data: null, error: {} }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(resolveCurrentSessionStatus()).resolves.toBe('anonymous');
  });

  it('does not turn a server failure into an anonymous session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'error', data: null, error: {} }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    await expect(resolveCurrentSessionStatus()).rejects.toMatchObject({ status: 500 });
  });
});
