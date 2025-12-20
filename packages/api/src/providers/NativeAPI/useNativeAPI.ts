import type { NativeAPI } from 'botframework-webchat-core';
import { useNativeAPIContext } from './private/NativeAPIContext';

export default function useNativeAPI(): readonly [NativeAPI] {
  return useNativeAPIContext().nativeAPIState;
}
