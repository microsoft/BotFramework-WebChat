import { getActionHistory } from '../utils/createStore';

export default function actionDispatched(type) {
  return {
    message: `action of type "${type}" dispatched`,
    fn: () => ~getActionHistory().findIndex(action => action.type === type)
  };
}
