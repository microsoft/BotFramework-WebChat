import useSelector from './useSelector';

export default function useDictateState() {
  return useSelector(({ dictateState }) => dictateState);
}
