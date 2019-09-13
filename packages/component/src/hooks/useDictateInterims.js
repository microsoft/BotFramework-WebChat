import { useSelector } from '../WebChatReduxContext';

export default function useDictateInterims() {
  return useSelector(({ dictateInterims }) => dictateInterims);
}
