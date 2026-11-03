// #region Schema.org
export {
  actionSchema as orgSchemaActionSchema,
  parseAction,
  type ActionOutput as OrgSchemaAction
} from './orgSchema/Action.js';
export {
  claimSchema as orgSchemaClaimSchema,
  parseClaim,
  type ClaimOutput as OrgSchemaClaim
} from './orgSchema/Claim.js';
export {
  creativeWorkSchema as orgSchemaCreativeWorkSchema,
  parseCreativeWork,
  type CreativeWorkOutput as OrgSchemaCreativeWork
} from './orgSchema/CreativeWork.js';
export {
  definedTermSchema as orgSchemaDefinedTermSchema,
  parseDefinedTerm,
  type DefinedTermOutput as OrgSchemaDefinedTerm
} from './orgSchema/DefinedTerm.js';
export { personSchema as orgSchemaPersonSchema, type PersonOutput as OrgSchemaPerson } from './orgSchema/Person.js';
export {
  projectSchema as orgSchemaProjectSchema,
  parseProject,
  type ProjectOutput as OrgSchemaProject
} from './orgSchema/Project.js';
export {
  softwareSourceCodeSchema as orgSchemaSoftwareSourceCodeSchema,
  type SoftwareSourceCodeOutput as OrgSchemaSoftwareSourceCode
} from './orgSchema/SoftwareSourceCode.js';
export {
  thingSchema as orgSchemaThingSchema,
  parseThing,
  type ThingOutput as OrgSchemaThing
} from './orgSchema/Thing.js';
export {
  userReviewSchema as orgSchemaUserReviewSchema,
  type UserReviewOutput as OrgSchemaUserReview
} from './orgSchema/UserReview.js';
export {
  voteActionSchema as orgSchemaVoteActionSchema,
  parseVoteAction,
  type VoteActionOutput as OrgSchemaVoteAction
} from './orgSchema/VoteAction.js';
// #endregion

export { default as isOfType } from './isOfType.js';
export { jsonLinkedDataSchema, type JSONLinkedDataInput, type JSONLinkedDataOutput } from './JSONLinkedData.js';
export { default as deepFreeze } from './private/deepFreeze.js';
