import { useSelector } from '../WebChatReduxContext';

export default function useLanguage() {
  return [
    useSelector(({ language }) => language),
    () => {
      throw new Error('Language must be set using props.');
    }
  ];
}
