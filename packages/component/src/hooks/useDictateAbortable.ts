import useSettableDictateAbortable from './internal/useSettableDictateAbortable';

export default function useDictateAbortable(): [boolean] {
  // We are only exporting a read-only version of dictateAbortable.
  const [dictateAbortable] = useSettableDictateAbortable();

  return [dictateAbortable];
}
