import type { BlankNodeIdentifier } from '../../node/BlankNodeIdentifier.ts';

const AUDIENCE_TYPES = Object.freeze(['channel', 'others', 'self'] as const);

type AudienceType = (typeof AUDIENCE_TYPES)[number];

/**
 * Gets `@id` of the `Audience` node of the specified audience type.
 */
function getAudienceId(audienceType: AudienceType): BlankNodeIdentifier {
  return `_:audience/${audienceType}`;
}

export { AUDIENCE_TYPES, getAudienceId, type AudienceType };
