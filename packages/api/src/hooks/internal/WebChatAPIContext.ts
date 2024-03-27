import { createContext } from 'react';

import { type AttachmentForScreenReaderComponentFactory } from '../../types/AttachmentForScreenReaderMiddleware';
import { type AvatarComponentFactory } from '../../types/AvatarMiddleware';
import { type GroupActivities } from '../../types/GroupActivitiesMiddleware';
import { type LegacyActivityRenderer } from '../../types/ActivityMiddleware';
import { type PerformCardAction } from '../../types/CardActionMiddleware';
import { type RenderActivityStatus } from '../../types/ActivityStatusMiddleware';
import { type RenderAttachment } from '../../types/AttachmentMiddleware';
import { type RenderToast } from '../../types/ToastMiddleware';
import { type ScrollToEndButtonComponentFactory } from '../../types/ScrollToEndButtonMiddleware';
import { type StrictStyleOptions } from '../../StyleOptions';
import type LocalizedStrings from '../../types/LocalizedStrings';
import type PrecompiledGlobalize from '../../types/PrecompiledGlobalize';
import type TelemetryMeasurementEvent from '../../types/TelemetryMeasurementEvent';

import { type DirectLineJSBotConnection, type Observable, type WebChatActivity } from 'botframework-webchat-core';

type WebChatAPIContext = {
  activityRenderer?: LegacyActivityRenderer;
  activityStatusRenderer: RenderActivityStatus;
  attachmentForScreenReaderRenderer?: AttachmentForScreenReaderComponentFactory;
  attachmentRenderer?: RenderAttachment;
  avatarRenderer?: AvatarComponentFactory;
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
  selectVoice?: (voices: (typeof window.SpeechSynthesisVoice)[], activity: WebChatActivity) => void;
  sendEvent?: (name: string, value: any) => void;
  sendFiles?: (files: File[]) => void;
  sendMessage?: (text: string, method?: string, { channelData }?: { channelData?: any }) => void;
  sendMessageBack?: (value: any, text?: string, displayText?: string) => void;
  sendPostBack?: (value?: any) => void;
  sendTypingIndicator?: boolean;
  setDictateInterims?: (interims: string[]) => void;
  setDictateState?: (dictateState: number) => void;
  setNotification?: (notification: Notification) => void;
  setSendBox?: (value: string) => void;
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
  userID?: string;
  username?: string;
};

const context = createContext<WebChatAPIContext>(undefined);

context.displayName = 'WebChatAPIContext';

export default context;
