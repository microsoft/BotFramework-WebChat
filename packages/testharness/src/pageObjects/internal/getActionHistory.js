import { getActionHistory as getActionHistoryFromStore } from '../../utils/createStore';

export default function getActionHistory() {
  return getActionHistoryFromStore();
}
