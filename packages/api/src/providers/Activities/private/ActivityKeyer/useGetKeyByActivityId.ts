import { type ActivityKey } from '../../../../types/ActivityKey';
import useActivityKeyerContext from './private/useContext';

/**
 * Gets a callback function, when called, will return the key of a specific activity.
 *
 * @returns A callback function, when called, will return the key of a specific activity.
 */
export default function useGetKeyByActivityId(): (activityId?: string) => ActivityKey | undefined {
  return useActivityKeyerContext().getKeyByActivityId;
}
