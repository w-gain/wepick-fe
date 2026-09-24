import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getMemberProfile,
  isNicknameAvailable,
  logoutCurrentSession,
  saveProfileChanges,
  toMemberProfile,
} from './api';

const user = {
  userId: 17,
  email: 'member@example.com',
  nickname: '말랑구름',
  profileImageUrl: '/uploads/profile/avatar.webp',
};

afterEach(() => vi.unstubAllGlobals());

describe('current BE profile adapter', () => {
  it('keeps only WePick profile fields and accepts the BE upload URL', () => {
    expect(toMemberProfile(user)).toEqual({
      id: '17',
      nickname: '말랑구름',
      profileImage: { kind: 'url', url: '/uploads/profile/avatar.webp' },
    });
    expect(toMemberProfile({ ...user, profileImageUrl: null }).profileImage).toEqual({
      kind: 'default',
      key: 'wepick-default',
    });
  });

  it('gets the current member from the BE endpoint with session cookies', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: 'get_user_success', data: user, error: null })),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMemberProfile()).resolves.toMatchObject({ id: '17', nickname: '말랑구름' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/me',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });
});

describe('current BE logout', () => {
  it('accepts a successful empty 204 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(logoutCurrentSession()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth',
      expect.objectContaining({ method: 'DELETE', credentials: 'include' }),
    );
  });

  it('does not report a failed logout as success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(logoutCurrentSession()).rejects.toThrow('API request failed with status 503');
  });
});

describe('current BE profile editing', () => {
  it('checks nickname duplication with the current BE contract', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: 'nickname_available', data: { isExisted: false } })),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(isNicknameAvailable('새닉네임')).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/check-nickname',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ nickname: '새닉네임' }),
      }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'nickname_available', data: { isExisted: true } })),
    );
    await expect(isNicknameAvailable('사용중')).resolves.toBe(false);
  });

  it('uses the dedicated endpoint when changing only the nickname', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'update_nickname_success',
          data: { ...user, nickname: '새닉네임' },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(saveProfileChanges({ nickname: '새닉네임' })).resolves.toMatchObject({
      nickname: '새닉네임',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/me/nickname',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ nickname: '새닉네임' }) }),
    );
  });

  it('uploads an image and patches only the image without clearing the nickname', async () => {
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: 'image_uploaded',
            data: { imageId: 25, key: 'profile/avatar.png', url: '/uploads/profile/avatar.png' },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: 'update_profile_image_success',
            data: { ...user, profileImageUrl: '/uploads/profile/avatar.png' },
          }),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(saveProfileChanges({ file })).resolves.toMatchObject({
      profileImage: { url: '/uploads/profile/avatar.png' },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/images/profile',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: expect.any(FormData),
      }),
    );
    const uploadOptions = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((uploadOptions.body as FormData).get('file')).toBe(file);
    expect(new Headers(uploadOptions.headers).has('Content-Type')).toBe(false);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/users/me/profile-image',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ profileImageId: 25 }) }),
    );
  });

  it('uses one profile PATCH when changing both nickname and image', async () => {
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: 'image_uploaded',
            data: { imageId: 25, key: 'profile/avatar.png', url: '/uploads/profile/avatar.png' },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: 'update_user_success',
            data: { ...user, nickname: '새닉네임' },
          }),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    await saveProfileChanges({ nickname: '새닉네임', file });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/users/me',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ nickname: '새닉네임', profileImageId: 25 }),
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never patches the profile when image upload fails', async () => {
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 413 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(saveProfileChanges({ nickname: '새닉네임', file })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
