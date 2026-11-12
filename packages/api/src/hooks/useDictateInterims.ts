import { useSelector } from '@msinternal/botframework-webchat-redux-store';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

const selectDictateInterims = ({ dictateInterims }) => dictateInterims;

export default function useDictateInterims(): [string[], (interims: string[]) => void] {
  return [useSelector(selectDictateInterims) || [], useWebChatAPIContext().setDictateInterims];
}
