// import { hooks, type ActivityComponentFactory } from 'botframework-webchat-api';
// import { type WebChatActivity } from 'botframework-webchat-core';
// import React, { type MutableRefObject, type ReactNode } from 'react';
// import TranscriptActivity from '../../../TranscriptActivity';
// import isZeroOrPositive from '../../../Utils/isZeroOrPositive';
// import useActivityElementMapRef from '../useActivityElementRef';

// const { useGetKeyByActivity, useStyleOptions } = hooks;

// type StatusGroupingProps = Readonly<{
//   activity: WebChatActivity;
//   activityElementMapRef: MutableRefObject<Map<string, HTMLElement>>;
//   children?: ReactNode | undefined;
//   firstOf: readonly string[];
//   lastOf: readonly string[];
//   positionIn: Readonly<{
//     [group: string]: number;
//   }>;
//   renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
//   renderAvatar: false | (() => Exclude<ReactNode, boolean | null | undefined>);
// }>;

// const StatusGrouping = ({ activity, firstOf, lastOf, renderActivity, renderAvatar }: StatusGroupingProps) => {
//   const [{ bubbleFromUserNubOffset, bubbleNubOffset, groupTimestamp, showAvatarInGroup }] = useStyleOptions();
//   const activityElementMapRef = useActivityElementMapRef();
//   const hideAllTimestamps = groupTimestamp === false;
//   const topSideBotNub = isZeroOrPositive(bubbleNubOffset);
//   const topSideUserNub = isZeroOrPositive(bubbleFromUserNubOffset);
//   const topSideNub = activity.from?.role === 'user' ? topSideUserNub : topSideBotNub;
//   const getKeyByActivity = useGetKeyByActivity();

//   let showCallout: boolean;

//   const key: string = getKeyByActivity(activity);

//   // Depending on the "showAvatarInGroup" setting, the avatar will render in different positions.
//   if (showAvatarInGroup === 'sender') {
//     if (topSideNub) {
//       showCallout = firstOf.includes('sender') && firstOf.includes('status');
//     } else {
//       showCallout = lastOf.includes('sender') && lastOf.includes('status');
//     }
//   } else if (showAvatarInGroup === 'status') {
//     if (topSideNub) {
//       showCallout = firstOf.includes('status');
//     } else {
//       showCallout = lastOf.includes('status');
//     }
//   } else {
//     showCallout = true;
//   }

//   return (
//     <TranscriptActivity
//       activity={activity}
//       activityElementMapRef={activityElementMapRef}
//       // "hideTimestamp" is a render-time parameter for renderActivityStatus().
//       // If true, it will hide the timestamp, but it will continue to show the
//       // retry prompt. And show the screen reader version of the timestamp.
//       activityKey={key}
//       hideTimestamp={hideAllTimestamps || !lastOf.includes('status')}
//       key={key}
//       renderActivity={renderActivity}
//       renderAvatar={renderAvatar}
//       showCallout={showCallout}
//     />
//   );
// };

// StatusGrouping.displayName = 'StatusGrouping';

// export default StatusGrouping;

// export { type StatusGroupingProps };
