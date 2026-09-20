import type { ZodType } from 'zod';

export type ResponseAdapter<T> = {
  fromResponse: (body: unknown) => T;
};

export function schemaResponseAdapter<T>(schema: ZodType<T>): ResponseAdapter<T> {
  return {
    fromResponse: (body) => schema.parse(body),
  };
}
