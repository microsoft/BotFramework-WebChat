import {
  type DirectLineJSBotConnection,
  type Observable,
  type WebChatActivity,
  type sendFiles,
  type sendMessage,
  type setSendBoxAttachments
} from 'botframework-webchat-core';
import { createContext } from 'react';

import { StrictStyleOptions } from '../../StyleOptions';
import { LegacyActivityRenderer } from '../../types/ActivityMiddleware';
import { RenderActivityStatus } from '../../types/ActivityStatusMiddleware';
import { AttachmentForScreenReaderComponentFactory } from '../../types/AttachmentForScreenReaderMiddleware';
import { RenderAttachment } from '../../types/AttachmentMiddleware';
import { AvatarComponentFactory } from '../../types/AvatarMiddleware';
import { PerformCardAction } from '../../types/CardActionMiddleware';
import { GroupActivities } from '../../types/GroupActivitiesMiddleware';
import LocalizedStrings from '../../types/LocalizedStrings';
import { type Notification } from '../../types/Notification';
import PrecompiledGlobalize from '../../types/PrecompiledGlobalize';
import { ScrollToEndButtonComponentFactory } from '../../types/ScrollToEndButtonMiddleware';
import TelemetryMeasurementEvent from '../../types/TelemetryMeasurementEvent';
import { RenderToast } from '../../types/ToastMiddleware';

export type WebChatAPIContextType = {
  activityRenderer?: LegacyActivityRenderer;
  activityStatusRenderer: RenderActivityStatus;
  attachmentForScreenReaderRenderer?: AttachmentForScreenReaderComponentFactory;
  attachmentRenderer?: RenderAttachment;
  avatarRenderer: AvatarComponentFactory;
  clearSuggestedActions?: () => void;
  dir?: string;
  directLine?: DirectLineJSBotConnection;
  dismissNotification?: (id: string) => void;
  downscaleImageToDataURL?: (
    blob: Blob,
    maxWidth: number,
    maxHeight: number,
    type: string,
    quality: number
  ) => Promise<URL>;
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
  setSendBoxAttachments?: (...args: Parameters<typeof setSendBoxAttachments>) => void;
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
  uiState: 'blueprint' | 'disabled' | undefined;
  userID?: string;
  username?: string;
};

const context = createContext<WebChatAPIContextType>(undefined);

context.displayName = 'WebChatAPIContext';

export default context;
