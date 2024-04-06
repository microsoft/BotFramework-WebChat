import { createContext, type Dispatch, type SetStateAction } from 'react';

import { StrictStyleOptions } from '../../StyleOptions';
import { LegacyActivityRenderer } from '../../types/ActivityMiddleware';
import { RenderActivityStatus } from '../../types/ActivityStatusMiddleware';
import { AttachmentForScreenReaderComponentFactory } from '../../types/AttachmentForScreenReaderMiddleware';
import { RenderAttachment } from '../../types/AttachmentMiddleware';
import { AvatarComponentFactory } from '../../types/AvatarMiddleware';
import { PerformCardAction } from '../../types/CardActionMiddleware';
import { GroupActivities } from '../../types/GroupActivitiesMiddleware';
import LocalizedStrings from '../../types/LocalizedStrings';
import Notification from '../../types/Notification';
import PrecompiledGlobalize from '../../types/PrecompiledGlobalize';
import { ScrollToEndButtonComponentFactory } from '../../types/ScrollToEndButtonMiddleware';
import TelemetryMeasurementEvent from '../../types/TelemetryMeasurementEvent';
import { RenderToast } from '../../types/ToastMiddleware';

import type {
  DirectLineJSBotConnection,
  Observable,
  sendFiles,
  sendMessage,
  WebChatActivity,
  WebChatPostActivityAttachment
} from 'botframework-webchat-core';

type WebChatAPIContext = {
  activityRenderer?: LegacyActivityRenderer;
  activityStatusRenderer: RenderActivityStatus;
  attachmentForScreenReaderRenderer?: AttachmentForScreenReaderComponentFactory;
  attachmentRenderer?: RenderAttachment;
  avatarRenderer: AvatarComponentFactory;
  clearSuggestedActions?: () => void;
  dir?: string;
  directLine?: DirectLineJSBotConnection;
  disabled?: boolean;
  dismissNotification?: (id: string) => void;
  downscaleImageToDataURL?: (blob: Blob, maxWidth: number, maxHeight: number, type: string, quality: number) => string;
  emitTypingIndicator?: () => void;
  grammars?: any;
  groupActivities?: GroupActivities;
  internalErrorBoxClass?: React.Component | Function;
  language?: string;
  localizedGlobalizeState?: PrecompiledGlobalize[];
  localizedStrings?: { [language: string]: LocalizedStrings };
  markActivity?: (activity: { id: string }, name: string, value?: any) => void;
  onCardAction?: PerformCardAction;
  onTelemetry?: (event: TelemetryMeasurementEvent) => void;
  postActivity?: (activity: WebChatActivity) => Observable<string>;
  renderMarkdown?: (
    markdown: string,
    newLineOptions: { markdownRespectCRLF: boolean },
    linkOptions: { externalLinkAlt: string }
  ) => string;
  scrollToEndButtonRenderer?: ScrollToEndButtonComponentFactory;
  selectVoice?: (
    voices: (typeof window.SpeechSynthesisVoice)[],
    activity: WebChatActivity
  ) => typeof window.SpeechSynthesisVoice;
  sendEvent?: (name: string, value: any) => void;
  sendFiles?: (...args: Parameters<typeof sendFiles>) => void;
  sendMessage?: (...args: Parameters<typeof sendMessage>) => void;
  sendMessageBack?: (value: any, text?: string, displayText?: string) => void;
  sendPostBack?: (value?: any) => void;
  sendTypingIndicator?: boolean;
  setDictateInterims?: (interims: string[]) => void;
  setDictateState?: (dictateState: number) => void;
  setNotification?: (notification: Notification) => void;
  setSendBox?: (value: string) => void;
  setSendBoxAttachments?: Dispatch<SetStateAction<readonly WebChatPostActivityAttachment[]>>;
  setSendTimeout?: (timeout: number) => void;
  startDictate?: () => void;
  startSpeakingActivity?: () => void;
  stopDictate?: () => void;
  stopSpeakingActivity?: () => void;
  styleOptions?: StrictStyleOptions;
  submitSendBox?: (method?: string, { channelData }?: { channelData: any }) => void;
  telemetryDimensionsRef?: React.Ref<any>;
  toastRenderer?: RenderToast;
  trackDimension?: (name: string, data: any) => void;
  typingIndicatorRenderer?: any; // TODO
  uploadButtonRef?: React.MutableRefObject<HTMLInputElement>;
  userID?: string;
  username?: string;
};

const context = createContext<WebChatAPIContext>(undefined);

context.displayName = 'WebChatAPIContext';

export default context;
