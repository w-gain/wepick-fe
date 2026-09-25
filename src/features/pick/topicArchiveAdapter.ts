import { z } from 'zod';

import { apiRequest } from '../../shared/api/client';
import { apiDataResponseAdapter, type ResponseAdapter } from '../../shared/api/responseAdapter';

const topicListItemSchema = z.object({
  topicId: z.number().int().positive(),
  title: z.string().min(1),
  targetDate: z.iso.date(),
  status: z.enum(['OPEN', 'CLOSED']),
});

const topicPageSchema = z.object({
  content: z.array(topicListItemSchema),
  number: z.number().int().nonnegative(),
  last: z.boolean(),
});

export type ArchiveTopicItem = {
  source: 'current-be';
  id: string;
  question: string;
  representativeDate: string;
};

export type ArchiveTopicPage = {
  items: ArchiveTopicItem[];
  nextCursor: string | null;
};

export function currentKstDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: 'year' | 'month' | 'day') => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function topicArchiveResponseAdapter(todayKst: string): ResponseAdapter<ArchiveTopicPage> {
  const pageAdapter = apiDataResponseAdapter(topicPageSchema);
  return {
    fromResponse(body) {
      const page = pageAdapter.fromResponse(body);
      return {
        items: page.content
          .filter((topic) => topic.targetDate < todayKst)
          .map((topic) => ({
            source: 'current-be',
            id: String(topic.topicId),
            question: topic.title,
            representativeDate: topic.targetDate,
          })),
        nextCursor: page.last ? null : String(page.number + 1),
      };
    },
  };
}

export function getTopicArchivePage(page: number, todayKst = currentKstDate()) {
  if (!Number.isSafeInteger(page) || page < 0) throw new Error('Invalid topic archive page.');
  return apiRequest<ArchiveTopicPage>(`/topics?page=${page}&size=20`, {
    method: 'GET',
    responseAdapter: topicArchiveResponseAdapter(todayKst),
  });
}
