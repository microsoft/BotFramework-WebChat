import useWebChatAPIContext from './useWebChatAPIContext';

export default function useSettableDictateAbortable() {
  const { dictateAbortable, setDictateAbortable } = useWebChatAPIContext();

  return [dictateAbortable, setDictateAbortable];
}
