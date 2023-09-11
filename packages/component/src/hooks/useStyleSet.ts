import type createStyleSet from '../Styles/createStyleSet';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useStyleSet(): [Record<keyof ReturnType<typeof createStyleSet>, any>] {
  return [useWebChatUIContext().styleSet];
}
