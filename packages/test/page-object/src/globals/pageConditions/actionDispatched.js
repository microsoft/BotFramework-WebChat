import became from './became';
import getActionHistory from '../pageObjects/internal/getActionHistory';

export default function actionDispatched(type) {
  return became(
    `action of type "${type}" dispatched`,
    () => ~getActionHistory().findIndex(action => action.type === type),
    15000
  );
}
