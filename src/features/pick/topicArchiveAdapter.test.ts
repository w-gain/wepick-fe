import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  currentKstDate,
  getTopicArchivePage,
  topicArchiveResponseAdapter,
} from './topicArchiveAdapter';

const topics = [
  { topicId: 3, title: '내일 질문', targetDate: '2026-09-25', status: 'OPEN' },
  { topicId: 2, title: '오늘 질문', targetDate: '2026-09-24', status: 'OPEN' },
  { topicId: 1, title: '지난 질문', targetDate: '2026-09-23', status: 'CLOSED' },
];

function response(page: number, last: boolean) {
  return {
    message: 'Topic archive retrieved',
    data: { content: topics, number: page, last },
    error: null,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('current BE topic archive', () => {
  it('uses the KST calendar date at midnight boundaries', () => {
    expect(currentKstDate(new Date('2026-09-23T15:30:00.000Z'))).toBe('2026-09-24');
  });

  it('keeps only past question and date fields without inventing participation', () => {
    expect(topicArchiveResponseAdapter('2026-09-24').fromResponse(response(0, false))).toEqual({
      items: [
        {
          source: 'current-be',
          id: '1',
          question: '지난 질문',
          representativeDate: '2026-09-23',
        },
      ],
      nextCursor: '1',
    });
    expect(
      topicArchiveResponseAdapter('2026-09-24').fromResponse(response(1, true)).nextCursor,
    ).toBeNull();
  });

  it('calls the paginated BE endpoint with session cookies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response(2, true))));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getTopicArchivePage(2, '2026-09-24')).resolves.toMatchObject({
      nextCursor: null,
      items: [{ id: '1' }],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/topics?page=2&size=20',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });
});
