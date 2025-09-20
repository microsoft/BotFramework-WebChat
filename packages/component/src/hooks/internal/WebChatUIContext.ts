import { createContext, type MutableRefObject } from 'react';

import { type FocusTranscriptInit } from '../../types/internal/FocusTranscriptInit';

export type ContextType = {
  focusTranscriptCallbacksRef: MutableRefObject<((init?: FocusTranscriptInit | undefined) => Promise<void>)[]>;
  nonce: string | undefined;

  // TODO: [P0] Infer the following types.
  dictateAbortable: any;
  dispatchScrollPosition: any;
  dispatchTranscriptFocusByActivityKey: any;
  internalMarkdownItState: [any];
  internalRenderMarkdownInline: any;
  numTranscriptFocusObservers: any;
  observeScrollPosition: any;
  observeTranscriptFocus: any;
  renderMarkdown: any;
  scrollToCallbacksRef: any;
  scrollToEndCallbacksRef: any;
  setDictateAbortable: any;
  styleSet: any;
  suggestedActionsAccessKey: any;
  webSpeechPonyfill: any;
};

const context = createContext<ContextType>(undefined as ContextType);

export default context;
