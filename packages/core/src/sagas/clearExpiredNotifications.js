// import { call, put, race, select, take } from 'redux-saga/effects';

// import { CLEAR_EXPIRED_NOTIFICATIONS } from '../actions/clearExpiredNotifications';
// import { ofNextExpiring } from '../selectors/notifications';
// import { SET_NOTIFICATION } from '../actions/setNotification';
// import sleep from '../utils/sleep';

// export default function* clearExpiredNotificationsSaga() {
//   for (;;) {
//     const nextExpiringNotification = ofNextExpiring()(yield select());
//     const { expireAt } = nextExpiringNotification || {};

//     const [setNotificationAction] = yield race([
//       take(SET_NOTIFICATION),

//       // If nothing is expiring, we will skip the sleep and just wait until action is dispatched.
//       ...(typeof expireAt === 'number' ? [call(sleep, Math.max(0, expireAt - Date.now()))] : [])
//     ]);

//     // If one of the notification has "expireAt = 0" (or a number earlier than now), we are giving these actions a chance to go to React, before removing them.
//     if (!setNotificationAction) {
//       yield put({ type: CLEAR_EXPIRED_NOTIFICATIONS });
//     }
//   }
// }
