import type { MemberProfile } from '../../shared/contracts';
import { memberProfileSchema } from '../../shared/contracts';
import { schemaResponseAdapter } from '../../shared/api/responseAdapter';

// Keep profile DTO changes at this boundary so screens continue to use MemberProfile.
export const memberProfileResponseAdapter =
  schemaResponseAdapter<MemberProfile>(memberProfileSchema);
