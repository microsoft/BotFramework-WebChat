import connect from './actions/connect';
import disconnect from './actions/disconnect';
import dismissNotification from './actions/dismissNotification';
import emitTypingIndicator from './actions/emitTypingIndicator';
import markActivity from './actions/markActivity';
import muteVoiceRecording from './actions/muteVoiceRecording';
import postActivity from './actions/postActivity';
import postVoiceActivity from './actions/postVoiceActivity';
import type { VoiceHandler } from './actions/registerVoiceHandler';
import registerVoiceHandler from './actions/registerVoiceHandler';
import sendEvent from './actions/sendEvent';
import sendFiles from './actions/sendFiles';
import sendMessage from './actions/sendMessage';
import sendMessageBack from './actions/sendMessageBack';
import sendPostBack from './actions/sendPostBack';
import setDictateInterims from './actions/setDictateInterims';
import setDictateState from './actions/setDictateState';
import setLanguage from './actions/setLanguage';
import setNotification from './actions/setNotification';
import setSendBox from './actions/setSendBox';
import setSendBoxAttachments from './actions/setSendBoxAttachments';
import setSendTimeout from './actions/setSendTimeout';
import setSendTypingIndicator from './actions/setSendTypingIndicator';
import type { VoiceState } from './actions/setVoiceState';
import setVoiceState from './actions/setVoiceState';
import startDictate from './actions/startDictate';
import startSpeakingActivity from './actions/startSpeakingActivity';
import startVoiceRecording from './actions/startVoiceRecording';
import stopDictate from './actions/stopDictate';
import stopSpeakingActivity from './actions/stopSpeakingActivity';
import stopVoiceRecording from './actions/stopVoiceRecording';
import submitSendBox from './actions/submitSendBox';
import unmuteVoiceRecording from './actions/unmuteVoiceRecording';
import unregisterVoiceHandler from './actions/unregisterVoiceHandler';
import * as ActivityClientState from './constants/ActivityClientState';
import * as DictateState from './constants/DictateState';
import createStore, {
  withDevTools as createStoreWithDevTools,
  withOptions as createStoreWithOptions
} from './createStore';
import getActivityLivestreamingMetadata from './utils/getActivityLivestreamingMetadata';
import getOrgSchemaMessage from './utils/getOrgSchemaMessage';
import onErrorResumeNext from './utils/onErrorResumeNext';
import getVoiceActivityRole from './utils/voiceActivity/getVoiceActivityRole';
import getVoiceActivityText from './utils/voiceActivity/getVoiceActivityText';
import isVoiceActivity from './utils/voiceActivity/isVoiceActivity';
import isVoiceTranscriptActivity from './utils/voiceActivity/isVoiceTranscriptActivity';

export {
  isForbiddenPropertyName,
  withResolvers,
  type PromiseWithResolvers
} from '@msinternal/botframework-webchat-base/utils';

export {
  CLEAR_SUGGESTED_ACTIONS,
  default as clearSuggestedActions,
  clearSuggestedActionsActionSchema,
  type ClearSuggestedActionsAction
} from './actions/clearSuggestedActions';

export {
  SET_SUGGESTED_ACTIONS,
  default as setSuggestedActions,
  setSuggestedActionsActionSchema,
  type SetSuggestedActionsAction
} from './actions/setSuggestedActions';

import type { GlobalScopePonyfill } from './types/GlobalScopePonyfill';
import type { SendBoxAttachment } from './types/SendBoxAttachment';
import type { WebChatActivity } from './types/WebChatActivity';
import type { DirectLineActivity } from './types/external/DirectLineActivity';
import type { DirectLineAnimationCard } from './types/external/DirectLineAnimationCard';
import type { DirectLineAttachment } from './types/external/DirectLineAttachment';
import type { DirectLineAudioCard } from './types/external/DirectLineAudioCard';
import type { DirectLineCardAction } from './types/external/DirectLineCardAction';
import type { DirectLineHeroCard } from './types/external/DirectLineHeroCard';
import type { DirectLineJSBotConnection } from './types/external/DirectLineJSBotConnection';
import type { DirectLineOAuthCard } from './types/external/DirectLineOAuthCard';
import type { DirectLineReceiptCard } from './types/external/DirectLineReceiptCard';
import type { DirectLineSignInCard } from './types/external/DirectLineSignInCard';
import type { DirectLineSuggestedAction } from './types/external/DirectLineSuggestedAction';
import type { DirectLineThumbnailCard } from './types/external/DirectLineThumbnailCard';
import type { DirectLineVideoCard } from './types/external/DirectLineVideoCard';
import type { Observable } from './types/external/Observable';

// #region Schema.org
export {
  actionSchema as orgSchemaActionSchema,
  parseAction,
  type ActionOutput as OrgSchemaAction
} from './types/external/OrgSchema/Action';
export {
  claimSchema as orgSchemaClaimSchema,
  parseClaim,
  type ClaimOutput as OrgSchemaClaim
} from './types/external/OrgSchema/Claim';
export {
  creativeWorkSchema as orgSchemaCreativeWorkSchema,
  parseCreativeWork,
  type CreativeWorkOutput as OrgSchemaCreativeWork
} from './types/external/OrgSchema/CreativeWork';
export {
  definedTermSchema as orgSchemaDefinedTermSchema,
  parseDefinedTerm,
  type DefinedTermOutput as OrgSchemaDefinedTerm
} from './types/external/OrgSchema/DefinedTerm';
export {
  personSchema as orgSchemaPersonSchema,
  type PersonOutput as OrgSchemaPerson
} from './types/external/OrgSchema/Person';
export {
  projectSchema as orgSchemaProjectSchema,
  parseProject,
  type ProjectOutput as OrgSchemaProject
} from './types/external/OrgSchema/Project';
export {
  softwareSourceCodeSchema as orgSchemaSoftwareSourceCodeSchema,
  type SoftwareSourceCodeOutput as OrgSchemaSoftwareSourceCode
} from './types/external/OrgSchema/SoftwareSourceCode';
export {
  thingSchema as orgSchemaThingSchema,
  parseThing,
  type ThingOutput as OrgSchemaThing
} from './types/external/OrgSchema/Thing';
export {
  userReviewSchema as orgSchemaUserReviewSchema,
  type UserReviewOutput as OrgSchemaUserReview
} from './types/external/OrgSchema/UserReview';
export {
  voteActionSchema as orgSchemaVoteActionSchema,
  parseVoteAction,
  type VoteActionOutput as OrgSchemaVoteAction
} from './types/external/OrgSchema/VoteAction';
// #endregion

/** @deprecated */
export { singleToArray, type OneOrMany } from '@msinternal/botframework-webchat-base/utils';

const Constants = { ActivityClientState, DictateState };

export {
  connect,
  Constants,
  createStore,
  createStoreWithDevTools,
  createStoreWithOptions,
  disconnect,
  dismissNotification,
  emitTypingIndicator,
  getActivityLivestreamingMetadata,
  getOrgSchemaMessage,
  getVoiceActivityRole,
  getVoiceActivityText,
  isVoiceActivity,
  isVoiceTranscriptActivity,
  markActivity,
  muteVoiceRecording,
  onErrorResumeNext,
  postActivity,
  postVoiceActivity,
  registerVoiceHandler,
  sendEvent,
  sendFiles,
  sendMessage,
  sendMessageBack,
  sendPostBack,
  setDictateInterims,
  setDictateState,
  setLanguage,
  setNotification,
  setSendBox,
  setSendBoxAttachments,
  setSendTimeout,
  setSendTypingIndicator,
  setVoiceState,
  startDictate,
  startSpeakingActivity,
  startVoiceRecording,
  stopDictate,
  stopSpeakingActivity,
  stopVoiceRecording,
  submitSendBox,
  unmuteVoiceRecording,
  unregisterVoiceHandler
};

export type {
  DirectLineActivity,
  DirectLineAnimationCard,
  DirectLineAttachment,
  DirectLineAudioCard,
  DirectLineCardAction,
  DirectLineHeroCard,
  DirectLineJSBotConnection,
  DirectLineOAuthCard,
  DirectLineReceiptCard,
  DirectLineSignInCard,
  DirectLineSuggestedAction,
  DirectLineThumbnailCard,
  DirectLineVideoCard,
  GlobalScopePonyfill,
  Observable,
  SendBoxAttachment,
  VoiceHandler,
  VoiceState,
  WebChatActivity
};

// #region Build info
import buildInfo from './buildInfo';

const { object: buildInfoObject, version } = buildInfo;

export { buildInfoObject as buildInfo, version };
// #endregion
