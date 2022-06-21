## How activities are being sorted?

Web Chat sort activities based on a few sort keys stamped by the chat service, with the following fallback order:

1. `activity.channelData['webchat:sequence-id']: number`
   -  This field represents the order of the activity in the chat history and can be a sparse number;
   -  This field is OPTIONAL, but RECOMMENDED;
   -  This field MUST be an integer number;
   -  This field MUST be an unique number assigned by the chat service;
   -  This field SHOULD be consistent across all members of the conversation.
1. Otherwise, `activity.timestamp: string`
   -  This field represents the server timestamp of the activity.
   -  This field is REQUIRED;
   -  This field MUST be an ISO date time string, for example, `2000-01-23T12:34:56.000Z`;
   -  This field MUST be assigned by the chat service, a.k.a. server timestamp;
   -  This field SHOULD have resolution up to 1 millisecond;
   -  This field MUST be the same across all members of the conversation.

Whenever an activity is updated, Web Chat will remove the existing activity from the chat history, then insert the updated version based on the new sort keys from the updated activity.

When an activity transit from "sending" state to "sent" state, it will trigger an update. Thus, it is possible and expected that, an activity could initially appear at a certain position. When it is updated, it could move to a new position to make it consistent with other members of the conversation.

## How about outgoing activities?

Since both all forementioned sort keys are assigned by the server, when the user is sending out a message, both sort keys are not available for sorting until Web Chat receive a server copy of the activities.

Web Chat will use the following algorithm to determine the temporal value of these activity-in-transit. This algorithm is applied when Web Chat is posting an activity to the chat service.

-  `activity.channelData['webchat:sequence-id']: number`
   1. Find the largest sequence ID in the current chat history;
   1. Increment it by `0.001`;
   1. Assign the value to the activity-in-transit.
-  `activity.timestamp: string`
   -  This field MUST be undefined.
-  `activity.localTimestamp: string`
   -  This field is based on local clock;
   -  This field MUST be an ISO date time string;
   -  This field is used to determine if the chat service timed out while posting the activity.

Note: Web Chat assumes the chat service should not backlog more than 1,000 activities at a time.

After the activity-in-transit arrives at the chat service, the chat service MUST update the sort keys and send the updated activity back to Web Chat.

## Assumptions of sequence ID and timestamp

Combining the algorithms above, Web Chat has the following assumptions

-  For all activities
   -  `activity.channelData['webchat:sequence-id']` SHOULD be set
      -  If unset, Web Chat will fill this value using epoch of `activity.timestamp`
-  For activities from self
   -  For activity-in-transit
      -  `activity.localTimestamp` MUST be set
      -  `activity.timestamp` MUST be `undefined` or unset
   -  For activity that has a server copy, a.k.a. successfully sent
      -  `activity.localTimestamp` is optional
      -  `activity.timestamp` MUST be set
-  For activities from others
   -  `activity.localTimestamp` is optional
   -  `activity.timestamp` MUST be set

## Related read

-  Posting an activity, [`sagas/postActivitySaga.ts`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/core/src/sagas/postActivitySaga.ts)
-  Inserting an activity into the chat history, [`reducers/activities.ts`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/core/src/reducers/activities.ts)
-  Activity type, [`types/WebChatActivity.ts`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/core/src/types/WebChatActivity.ts)
