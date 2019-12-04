import useWebChatUIContext from './useWebChatUIContext';

export default function useSettableDictateAbortable() {
  const { dictateAbortable, setDictateAbortable } = useWebChatUIContext();

  return [dictateAbortable, setDictateAbortable];
}
