import type { RootDebugAPI } from 'botframework-webchat-core/internal';
import { useDebugAPIContext } from './private/DebugAPIContext';

export default function useDebugAPI(): readonly [RootDebugAPI] {
  return useDebugAPIContext().rootDebugAPIState;
}

export { type RootDebugAPI };
