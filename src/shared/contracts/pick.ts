import { z } from 'zod';

export const choiceSchema = z.enum(['A', 'B']);
export type Choice = z.infer<typeof choiceSchema>;

export const categorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const pickOptionSchema = z.object({
  id: z.number().int().positive().nullable(),
  choice: choiceSchema,
  label: z.string().min(1),
  imageUrl: z.url().nullable(),
});

export const voteResultSchema = z
  .object({
    totalVotes: z.number().int().nonnegative(),
    options: z.object({
      A: z.object({ count: z.number().int().nonnegative(), percent: z.number().min(0).max(100) }),
      B: z.object({ count: z.number().int().nonnegative(), percent: z.number().min(0).max(100) }),
    }),
  })
  .superRefine((result, context) => {
    if (result.options.A.count + result.options.B.count !== result.totalVotes) {
      context.addIssue({ code: 'custom', message: '선택지별 투표수 합계가 전체 투표수와 달라요.' });
    }
    if (result.options.A.percent + result.options.B.percent !== 100) {
      context.addIssue({ code: 'custom', message: '선택지별 비율 합계는 100이어야 해요.' });
    }
  });

export const profileImageSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('default'), key: z.string().min(1) }),
  z.object({
    kind: z.literal('url'),
    url: z.union([z.url(), z.string().regex(/^\/(?!\/)[^\s]*$/)]),
  }),
]);

export const memberSummarySchema = z.object({
  id: z.string().min(1),
  nickname: z.string().min(1),
  profileImage: profileImageSchema,
});

export const opinionSchema = z.object({
  id: z.string().min(1),
  choice: choiceSchema,
  body: z.string().min(1).max(500),
  author: memberSummarySchema,
  createdAt: z.iso.datetime(),
  edited: z.boolean(),
  likedByMe: z.boolean(),
  likeCount: z.number().int().nonnegative(),
  ownedByMe: z.boolean(),
});

const pickBaseSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  category: categorySchema.nullable(),
  representativeDate: z.iso.date(),
  options: z.tuple([pickOptionSchema, pickOptionSchema]),
  userVote: choiceSchema.nullable(),
  result: voteResultSchema.nullable(),
  representativeOpinions: z.object({ A: opinionSchema.nullable(), B: opinionSchema.nullable() }),
});

export const pickSchema = pickBaseSchema
  .extend({ opinionsAvailable: z.boolean() })
  .superRefine((pick, context) => {
    if (pick.options[0].choice !== 'A' || pick.options[1].choice !== 'B') {
      context.addIssue({
        code: 'custom',
        path: ['options'],
        message: '선택지는 A, B 순서여야 해요.',
      });
    }
    if ((pick.userVote === null) !== (pick.result === null)) {
      context.addIssue({
        code: 'custom',
        path: ['result'],
        message: '사용자 투표와 결과 공개 상태가 일치해야 해요.',
      });
    }
    if (!pick.opinionsAvailable && Object.values(pick.representativeOpinions).some(Boolean)) {
      context.addIssue({
        code: 'custom',
        path: ['representativeOpinions'],
        message: '의견을 제공하지 않는 Pick에는 대표 의견을 표시할 수 없어요.',
      });
    }
  });

export const pickSummarySchema = pickBaseSchema.pick({
  id: true,
  question: true,
  category: true,
  representativeDate: true,
  options: true,
  userVote: true,
});

export const pickListSchema = z.object({
  items: z.array(pickSummarySchema),
  nextCursor: z.string().nullable(),
});

export const opinionListSchema = z.object({
  items: z.array(opinionSchema),
  nextCursor: z.string().nullable(),
});

export type Pick = z.infer<typeof pickSchema>;
export type VoteResult = z.infer<typeof voteResultSchema>;
export type Opinion = z.infer<typeof opinionSchema>;
export type PickList = z.infer<typeof pickListSchema>;
export type OpinionList = z.infer<typeof opinionListSchema>;
