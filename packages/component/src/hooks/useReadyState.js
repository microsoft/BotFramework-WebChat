import useSelector from './useSelector';

export default function useReadyState() {
  return useSelector(({ readyState }) => readyState);
}
