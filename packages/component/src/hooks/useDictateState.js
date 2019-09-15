import { useSelector } from '../WebChatReduxContext';

export default function useDictateState() {
  return [
    useSelector(({ dictateState }) => dictateState),
    () => {
      throw new Error(
        'DictateState cannot be set directly. You must use useStartDictate() and useStopDictate() to control the dictation behavior.'
      );
    }
  ];
}
