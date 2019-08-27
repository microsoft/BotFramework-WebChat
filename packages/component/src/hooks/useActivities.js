import useSelector from './useSelector';

export default function useActivities() {
  return useSelector(({ activities }) => activities);
}
