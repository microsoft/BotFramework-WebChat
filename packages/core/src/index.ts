import connect from './actions/connect';
import disconnect from './actions/disconnect';
import dismissNotification from './actions/dismissNotification';
import emitTypingIndicator from './actions/emitTypingIndicator';
import markActivity from './actions/markActivity';
import postActivity from './actions/postActivity';
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
import startDictate from './actions/startDictate';
import startSpeakingActivity from './actions/startSpeakingActivity';
import stopDictate from './actions/stopDictate';
import stopSpeakingActivity from './actions/stopSpeakingActivity';
import submitSendBox from './actions/submitSendBox';
import * as ActivityClientState from './constants/ActivityClientState';
import * as DictateState from './constants/DictateState';
import createStore, {
  withDevTools as createStoreWithDevTools,
  withOptions as createStoreWithOptions
} from './createStore';
import OneOrMany from './types/OneOrMany';
import { parseAction } from './types/external/OrgSchema/Action';
import { parseClaim } from './types/external/OrgSchema/Claim';
import { parseCreativeWork } from './types/external/OrgSchema/CreativeWork';
import { parseDefinedTerm } from './types/external/OrgSchema/DefinedTerm';
import { parseProject } from './types/external/OrgSchema/Project';
import { parseThing } from './types/external/OrgSchema/Thing';
import { parseVoteAction } from './types/external/OrgSchema/VoteAction';
import getActivityLivestreamingMetadata from './utils/getActivityLivestreamingMetadata';
import getOrgSchemaMessage from './utils/getOrgSchemaMessage';
import onErrorResumeNext from './utils/onErrorResumeNext';
import singleToArray from './utils/singleToArray';

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
import type { Action as OrgSchemaAction } from './types/external/OrgSchema/Action';
import type { Claim as OrgSchemaClaim } from './types/external/OrgSchema/Claim';
import type { CreativeWork as OrgSchemaCreativeWork } from './types/external/OrgSchema/CreativeWork';
import type { DefinedTerm as OrgSchemaDefinedTerm } from './types/external/OrgSchema/DefinedTerm';
import type { Project as OrgSchemaProject } from './types/external/OrgSchema/Project';
import type { Thing as OrgSchemaThing } from './types/external/OrgSchema/Thing';
import type { UserReview as OrgSchemaUserReview } from './types/external/OrgSchema/UserReview';

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
  markActivity,
  onErrorResumeNext,
  parseAction,
  parseClaim,
  parseCreativeWork,
  parseDefinedTerm,
  parseProject,
  parseThing,
  parseVoteAction,
  postActivity,
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
  singleToArray,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox
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
  OneOrMany,
  OrgSchemaAction,
  OrgSchemaClaim,
  OrgSchemaCreativeWork,
  OrgSchemaDefinedTerm,
  OrgSchemaProject,
  OrgSchemaThing,
  OrgSchemaUserReview,
  SendBoxAttachment,
  WebChatActivity
};

// #region Build info
import buildInfo from './buildInfo';

const { object: buildInfoObject, version } = buildInfo;

export { buildInfoObject as buildInfo, version };
// #endregion
