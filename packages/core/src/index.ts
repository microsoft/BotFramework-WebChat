import * as ActivityClientState from './constants/ActivityClientState';
import * as DictateState from './constants/DictateState';
import clearSuggestedActions from './actions/clearSuggestedActions';
import connect from './actions/connect';
import createStore, {
  withDevTools as createStoreWithDevTools,
  withOptions as createStoreWithOptions
} from './createStore';
import disconnect from './actions/disconnect';
import dismissNotification from './actions/dismissNotification';
import emitTypingIndicator from './actions/emitTypingIndicator';
import isForbiddenPropertyName from './utils/isForbiddenPropertyName';
import markActivity from './actions/markActivity';
import OneOrMany from './types/OneOrMany';
import onErrorResumeNext from './utils/onErrorResumeNext';
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
import setSendTimeout from './actions/setSendTimeout';
import setSendTypingIndicator from './actions/setSendTypingIndicator';
import singleToArray from './utils/singleToArray';
import startDictate from './actions/startDictate';
import startSpeakingActivity from './actions/startSpeakingActivity';
import stopDictate from './actions/stopDictate';
import stopSpeakingActivity from './actions/stopSpeakingActivity';
import submitSendBox from './actions/submitSendBox';
import warnOnce from './utils/warnOnce';

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
import type { GlobalScopePonyfill } from './types/GlobalScopePonyfill';
import type { Observable } from './types/external/Observable';
import type { OrgSchemaThing } from './types/external/OrgSchemaThing';
import type { WebChatActivity } from './types/WebChatActivity';

const Constants = { ActivityClientState, DictateState };
const version = process.env.npm_package_version;

export {
  clearSuggestedActions,
  connect,
  Constants,
  createStore,
  createStoreWithDevTools,
  createStoreWithOptions,
  disconnect,
  dismissNotification,
  emitTypingIndicator,
  isForbiddenPropertyName,
  markActivity,
  onErrorResumeNext,
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
  setSendTimeout,
  setSendTypingIndicator,
  singleToArray,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox,
  version,
  warnOnce
};

export type {
  DirectLineActivity,
  DirectLineAnimationCard,
  DirectLineAttachment,
  DirectLineAudioCard,
  DirectLineCardAction,
  DirectLineHeroCard,
  DirectLineOAuthCard,
  DirectLineJSBotConnection,
  DirectLineReceiptCard,
  DirectLineSignInCard,
  DirectLineSuggestedAction,
  DirectLineThumbnailCard,
  DirectLineVideoCard,
  Observable,
  OneOrMany,
  GlobalScopePonyfill,
  OrgSchemaThing,
  WebChatActivity
};
