# How to implement a chat adapter?

You can write your own chat adapter to use Web Chat on other services.

Currently, the chat adapter interface Web Chat is using is adopted from the [`BotFramework-DirectLineJS`](https://github.com/microsoft/BotFramework-DirectLineJS) (DLJS) project. This is a "streaming" interface, the chat adapter do not keep any history or state about activities.

The DLJS interface heavily relies on [Observable](https://github.com/tc39/proposal-observable) and [Bot Framework REST API](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-connector-api-reference?view=azure-bot-service-4.0#activity-object).

## `activity$: Observable<Activity>`

An Observable to notify Web Chat when an [Activity](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-connector-api-reference?view=azure-bot-service-4.0#activity-object) arrives. This Observable must contains all recent activities in the conversation, including both incoming and outgoing activities.

When Web Chat post an outgoing activity, this Observable should notify Web Chat with that activity. And the service is expected to "fill-in-the-blank" for the outgoing activity, such as timestamp (the time when the activity is being posted to the service), service-assigned ID, sender ID, conversation ID, etc.

Activity with `from.role` of `"user"` means it is an activity coming from the user who is using Web Chat. Activity with `from.role` of `"bot"` are from other users, including bots.

### Updating activities

Web Chat uses 2 different IDs to identify if 2 activities are the same or not:

-  `activity.channelData.clientActivityID` is an ID set by Web Chat on all outgoing activity from the current session, ignored if the value is falsy
-  `activity.id` is an ID set by the chat platform

If either one of the IDs are the same, Web Chat will consider both are identifying the same activity. And it will replace the activity with last writer win strategy.

### Sorting activities

`activity.timestamp` is a service-assigned timestamp and is used to reorder activities in the transcript.

For recent outgoing activities which service-assigned timestamp is not received from the server yet, Web Chat will use a timestamp with an estimated server clock.

If an activity is updated with a different `activity.timestamp` value, Web Chat will honor the updated timestamp by moving the activity to a different location.

### Delaying activities

For accessibility reasons, activities must be placed on the screen based on their chronological order. As screen reader pick up activity at the time it was placed on the screen, it is not possible to reorder and sort activities once they are on-screen.

However, the chat service send activities over the network and chat adapter may receive activities with a slightly out-of-order fashion.

Web Chat use `activity.replyToId` as a hint for the order of messages. Please read more about it [here](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/ACCESSIBILITY.md#ux-message-ordering).

If the chat service is not able to provide the `replyToId` field, please make sure activities sent through the `activity$` Observable is in chronological order.

### Conversation history

Currently, Web Chat do not differentiate whether an activity is from previous or current conversation.

## `connectionStatus$: Observable<ConnectionStatus>`

An Observable to notify the state of the connection:

-  `0` means uninitialized
-  `1` means connecting
-  `2` means connected and online
-  `3` means the token has expired
-  `4` means the initial connection failed to establish, or connection is interrupted
-  `5` means the connection has ended

When connection is interrupted, the chat adapter should notify Web Chat by sending `4`. It is up to the chat adapter to reconnect. When the connection is reestablished, it should notify Web Chat by sending `2`.

## `postActivity(activity: Activity): Observable<string>`

A function callback for posting an outgoing activity to the chat service. Web Chat will call this function and expect the service to return a service-assigned activity ID.

Although this function only returns a single ID when the activity is successfully sent, historically, the function return Observable instead of Promise.

After the activity is posted to the chat service, the chat service should add more details to the activity (e.g. ID, timestamp, sender information, etc) and echo it back via the `activity$` Observable.

### Service-assigned ID vs. client-assigned ID

When an activity is successfully queued to the chat service, the service must return an ID to uniquely identify the activity in the conversation.

However, this service-assigned ID may not be available until a latter time, such as, after the echo back from the `activity$` Observable.

To track the outgoing activity, before posting the activity, Web Chat will generate an unique client-assigned ID and assign it to `activity.channelData.clientActivityID`. This value must be persisted when the activity is being echoed back from the `activity$` Observable.

### Sending and sent

Web Chat requires 2 signals from the chat adapter to turns the activity state from "Sending" to "Sent":

-  A postive feedback from the `postActivity` call
   -  This include a service-assigned activity ID and a `complete` signal, from the `Observable<string>` return value
-  Outgoing activity echoed back via the `activity$` Observable
   -  The outgoing activity must echo back through the `activity$` Observable
   -  Web Chat use the `activity.channelData.clientActivityID` value to identify the outgoing activity from streams of incoming activity

If either one of the signals is not received, Web Chat will not turn the state to "Sent". Web Chat would eventually display a "Send failed, retry" message based on a modifiable timeout value set by the web developer.

Despite "Send failed, retry" message being displayed, the chat service can continue to provide these signals if the activity eventually went through the service. In such case, Web Chat will turn the the activity state from failure to "Sent".

## RxJS vs. ES Observable

Although DLJS is using RxJS for the Observable implementation, it is possible and recommended to use ES Observable with some tweaks. Currently, some chat adapters offered by Web Chat are using Observable implementation from `core-js`, instead of RxJS.

Unlike ES Observable, which is expected to start a new connection on every `subscribe()`, DLJS use a singleton behind the Observable. It means, the first observer subscribed to the `activity$` will start the connection. Subsequent observers subscribing the Observable object will only receive new incoming activity from that point of time. All observers "share" the same connection. We understand this is a drift from the best practices for Observable and will address this in future chat adapter upgrade.

There are two Observable exposed by DLJS: `activity$` and `connectionStatus$`. Connection to the chat service should be established only when Web Chat initially subscribe to `activity$`. The chat adapter should have no effect on the connection when Web Chat subscribe to `connectionStatus$`.

## Other APIs

-  `end(): void` is for ending a conversation
   -  This is unused in Web Chat as we currently do not have a user feature to end the conversation
-  `getSessionId(): Observable<string>` is used to construct a special OAuth sign-in URL with Azure Bot Services
   -  Please read more about it [here](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/api/src/hooks/Composer.tsx#L123)
-  `referenceGrammarId: string` is for Azure Cognitive Services to improve speech recognition accuracy
   -  Web Chat pass this value as-is between Azure Bot Services and Azure Cognitive Services

## Readings

To understand how Web Chat talks to the chat adapter interface, you can read our [Redux sagas here](https://github.com/microsoft/BotFramework-WebChat/tree/main/packages/core/src/sagas).
