import type createStyleSet from '../Styles/createStyleSet';
import useWebChatUIContext from './internal/useWebChatUIContext';

// TODO: Seems type of value is `string`.
export default function useStyleSet(): readonly [Record<keyof ReturnType<typeof createStyleSet>, any>] {
  return Object.freeze([useWebChatUIContext().styleSet] as const);
}
