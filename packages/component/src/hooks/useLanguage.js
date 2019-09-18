import { useSelector } from '../WebChatReduxContext';

export default function useLanguage() {
  return [useSelector(({ language }) => language)];
}
