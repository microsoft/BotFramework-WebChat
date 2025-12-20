import type { InternalNativeAPI } from 'botframework-webchat-core';
import { useNativeAPIContext } from './private/NativeAPIContext';

export default function useInternalNativeAPI(): readonly [InternalNativeAPI] {
  return useNativeAPIContext().internalNativeAPIState;
}
