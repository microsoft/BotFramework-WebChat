import { createContext } from 'react';

import { AttachmentForScreenReaderComponentFactory } from '../../types/AttachmentForScreenReaderMiddleware';
import { AvatarComponentFactory } from '../../types/AvatarMiddleware';
import { GroupActivities } from '../../types/GroupActivitiesMiddleware';
import { LegacyActivityRenderer } from '../../types/ActivityMiddleware';
import { PerformCardAction } from '../../types/CardActionMiddleware';
import { RenderActivityStatus } from '../../types/ActivityStatusMiddleware';
import { RenderAttachment } from '../../types/AttachmentMiddleware';
import { RenderToast } from '../../types/ToastMiddleware';
import { ScrollToEndButtonComponentFactory } from '../../types/ScrollToEndButtonMiddleware';
import { StrictStyleOptions } from '../../StyleOptions';
import LocalizedStrings from '../../types/LocalizedStrings';
import PrecompiledGlobalize from '../../types/PrecompiledGlobalize';
import TelemetryMeasurementEvent from '../../types/TelemetryMeasurementEvent';

import type { DirectLineJSBotConnection, Observable, WebChatActivity } from 'botframework-webchat-core';

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
  files?: File[];
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
  sendFiles?: (files: File[], text?: string) => void;
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
  uploadButtonRef?: React.MutableRefObject<HTMLInputElement>;
  userID?: string;
  username?: string;
};

const context = createContext<WebChatAPIContext>(undefined);

context.displayName = 'WebChatAPIContext';

export default context;
