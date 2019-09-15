import { useSelector } from '../WebChatReduxContext';

export default function useSendTypingIndicator() {
  return [
    useSelector(({ sendTypingIndicator }) => sendTypingIndicator),
    () => {
      throw new Error('SendTypingIndicator must be set using props.');
    }
  ];
}
