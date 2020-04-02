import getActionHistory from '../pageObjects/internal/getActionHistory';

export default function actionDispatched(type) {
  return {
    message: `action of type "${type}" dispatched`,
    fn: () => ~getActionHistory().findIndex(action => action.type === type)
  };
}
