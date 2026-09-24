import { z } from 'zod';

import { choiceSchema, memberSummarySchema, pickSummarySchema } from './pick';

export const memberProfileSchema = memberSummarySchema;

export const voteHistoryItemSchema = z.object({
  id: z.string().min(1),
  pick: pickSummarySchema,
  choice: choiceSchema,
  votedAt: z.iso.datetime(),
});

export const voteHistorySchema = z.object({
  items: z.array(voteHistoryItemSchema),
  nextCursor: z.string().nullable(),
});

export type MemberProfile = z.infer<typeof memberProfileSchema>;
export type VoteHistory = z.infer<typeof voteHistorySchema>;
