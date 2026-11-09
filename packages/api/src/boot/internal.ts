export { __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol } from '@msinternal/botframework-webchat-api-middleware';
export { default as LowPriorityDecoratorComposer } from '../decorator/internal/LowPriorityDecoratorComposer';
export { default as usePostVoiceActivity } from '../hooks/internal/usePostVoiceActivity';
export { default as useSetDictateState } from '../hooks/internal/useSetDictateState';
export { default as useShouldShowMicrophoneButton } from '../hooks/internal/useShouldShowMicrophoneButton';
export { LegacyActivityContextProvider, type LegacyActivityContextType } from '../legacy/LegacyActivityBridgeContext';
// For tests only: <Composer> without a `store` uses the default providers (no Redux) when enabled.
export { setInternalDefaultModeEnabled as __INTERNAL_DO_NOT_USE__setDefaultModeEnabled } from '../providers/internalDefaultMode';
// For tests only: how many times each provider set mounted, and what the default providers connected to a Direct Line show.
export { getProviderMountCounts as __INTERNAL_DO_NOT_USE__getProviderMountCounts } from '../providers/internalDefaultMode';
export { getTestHandle as __INTERNAL_DO_NOT_USE__getTestHandle } from '../providers/default/private/testHandles';
export { default as StyleOptionsComposer } from '../providers/StyleOptions/StyleOptionsComposer';
