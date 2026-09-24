import type { ZodType } from 'zod';
import { z } from 'zod';

export type ResponseAdapter<T> = {
  fromResponse: (body: unknown) => T;
};

export function schemaResponseAdapter<T>(schema: ZodType<T>): ResponseAdapter<T> {
  return {
    fromResponse: (body) => schema.parse(body),
  };
}

const apiDataEnvelopeSchema = z.object({ data: z.unknown() });

export function apiDataResponseAdapter<T>(schema: ZodType<T>): ResponseAdapter<T> {
  return {
    fromResponse: (body) => {
      const envelope = apiDataEnvelopeSchema.parse(body);
      return schema.parse(envelope.data);
    },
  };
}
