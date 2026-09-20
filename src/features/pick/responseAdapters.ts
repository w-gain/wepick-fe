import type { OpinionList, Pick, PickList, VoteHistory } from '../../shared/contracts';
import {
  opinionListSchema,
  pickListSchema,
  pickSchema,
  voteHistorySchema,
} from '../../shared/contracts';
import { schemaResponseAdapter } from '../../shared/api/responseAdapter';

// Screen contracts and transport DTOs currently have the same shape in mock mode.
// Current and target BE DTO mappings belong here instead of inside screen components.
export const pickResponseAdapter = schemaResponseAdapter<Pick>(pickSchema);
export const pickListResponseAdapter = schemaResponseAdapter<PickList>(pickListSchema);
export const opinionListResponseAdapter = schemaResponseAdapter<OpinionList>(opinionListSchema);
export const voteHistoryResponseAdapter = schemaResponseAdapter<VoteHistory>(voteHistorySchema);
