import useSelector from './useSelector';

export default function useDictateInterims() {
  return useSelector(({ dictateInterims }) => dictateInterims);
}
