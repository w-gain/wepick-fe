import { z } from 'zod';

import type { Pick } from '../../shared/contracts';
import { pickSchema } from '../../shared/contracts';
import { apiDataResponseAdapter, type ResponseAdapter } from '../../shared/api/responseAdapter';

const currentTopicOptionSchema = z.object({
  optionId: z.number().int().positive(),
  label: z.enum(['A', 'B']),
  text: z.string().min(1),
  voteCount: z.number().int().nonnegative(),
  percent: z.number().int().min(0).max(100),
});

const currentTopicDtoSchema = z.object({
  topicId: z.number().int().positive(),
  title: z.string().min(1),
  targetDate: z.iso.date(),
  status: z.enum(['OPEN', 'CLOSED']),
  options: z.array(currentTopicOptionSchema).length(2),
  totalVotes: z.number().int().nonnegative(),
  votedOptionId: z.number().int().positive().nullable(),
});

const currentTopicDataAdapter = apiDataResponseAdapter(currentTopicDtoSchema);

export const currentTopicResponseAdapter: ResponseAdapter<Pick> = {
  fromResponse(body) {
    const topic = currentTopicDataAdapter.fromResponse(body);
    const optionA = topic.options.find((option) => option.label === 'A');
    const optionB = topic.options.find((option) => option.label === 'B');
    if (!optionA || !optionB || optionA.optionId === optionB.optionId) {
      throw new Error('Current topic must have distinct A and B options.');
    }
    if (optionA.voteCount + optionB.voteCount !== topic.totalVotes) {
      throw new Error('Current topic vote counts do not match the total.');
    }

    const votedOption = topic.options.find((option) => option.optionId === topic.votedOptionId);
    if (topic.votedOptionId !== null && !votedOption) {
      throw new Error('Current topic vote does not belong to an option.');
    }
    const userVote = votedOption?.label ?? null;
    if (userVote && topic.totalVotes === 0) {
      throw new Error('A voted topic cannot have zero total votes.');
    }
    const percentA =
      topic.totalVotes > 0 ? Math.round((optionA.voteCount / topic.totalVotes) * 100) : 0;

    return pickSchema.parse({
      id: String(topic.topicId),
      question: topic.title,
      category: null,
      representativeDate: topic.targetDate,
      options: [
        { id: optionA.optionId, choice: 'A', label: optionA.text, imageUrl: null },
        { id: optionB.optionId, choice: 'B', label: optionB.text, imageUrl: null },
      ],
      userVote,
      result: userVote
        ? {
            totalVotes: topic.totalVotes,
            options: {
              A: { count: optionA.voteCount, percent: percentA },
              B: { count: optionB.voteCount, percent: 100 - percentA },
            },
          }
        : null,
      representativeOpinions: { A: null, B: null },
      opinionsAvailable: false,
    });
  },
};
