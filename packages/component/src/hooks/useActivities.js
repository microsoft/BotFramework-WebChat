import { useSelector } from '../WebChatReduxContext';

export default function useActivities() {
  return [
    useSelector(({ activities }) => activities),
    () => {
      throw new Error('Activities cannot be set.');
    }
  ];
}
