// /* eslint react/no-danger: "off" */

// import { css } from 'glamor';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';
// import React from 'react';

// import DismissIcon from './DismissIcon';
// import NotificationIcon from './NotificationIcon';
// import ScreenReaderText from '../ScreenReaderText';
// import useLocalize from '../hooks/useLocalize';
// import useStyleSet from '../hooks/useStyleSet';

// const ROOT_CSS = css({
//   display: 'flex',

//   '& .webchat__notification__content': {
//     flex: 1
//   }
// });

// const Notification = ({ 'aria-labelledby': ariaLabelledBy, children, level, onDismiss }) => {
//   const [{ notification: notificationStyleSet }] = useStyleSet();
//   const dismissButtonText = useLocalize('NOTIFICATION_DISMISS_BUTTON');

//   return (
//     <div
//       className={classNames(ROOT_CSS + '', notificationStyleSet + '', {
//         'webchat__notification--error': level === 'error',
//         'webchat__notification--info': level === 'info',
//         'webchat__notification--success': level === 'success',
//         'webchat__notification--warn': level === 'warn'
//       })}
//       aria-labelledby={ariaLabelledBy}
//       role="dialog"
//     >
//       <div aria-hidden={true} className="webchat__notification__iconBox">
//         <NotificationIcon className="webchat__notification__icon" level={level} />
//       </div>
//       <div className="webchat__notification__content">{children}</div>
//       {!!onDismiss && (
//         <button
//           aria-label={dismissButtonText}
//           className="webchat__notification__dismissButton"
//           onClick={onDismiss}
//           type="button"
//         >
//           <div className="webchat__notification__dismissButtonFocus">
//             <DismissIcon />
//           </div>
//         </button>
//       )}
//     </div>
//   );
// };

// Notification.defaultProps = {
//   children: undefined,
//   onDismiss: undefined
// };

// Notification.propTypes = {
//   children: PropTypes.any,
//   level: PropTypes.oneOf(['error', 'warn', 'info', 'success']).isRequired,
//   onDismiss: PropTypes.func
// };

// export default Notification;
