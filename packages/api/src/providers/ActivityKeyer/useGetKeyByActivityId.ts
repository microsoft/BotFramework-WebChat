import useActivityKeyerContext from './private/useContext';

export default function useGetKeyByActivityId(): (activityId?: string) => string | undefined {
  return useActivityKeyerContext().getKeyByActivityId;
}
