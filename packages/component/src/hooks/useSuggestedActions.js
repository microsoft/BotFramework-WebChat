import useSelector from './useSelector';

export default function useSuggestedActions() {
  return useSelector(({ suggestedActions }) => suggestedActions);
}
