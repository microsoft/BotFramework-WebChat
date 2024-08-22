# Livestreaming

This document describes how livestreaming works in Web Chat.

## Background

Livestreaming is a popular technique to improve user experience for bots/copilots that use large-language models (LLM) to generate response.

Web Chat added livestreaming support since version [4.17.0](../CHANGELOG.md#4170---2024-05-06).

## Terminology

### Livestreaming

> Also known as: streaming response.

Livestreaming is the mechanism to progressively send an activity.

### Livestreaming session

A single bot, at its turn, can livestream multiple activities simultaneously each with their own content. Each livestream will be isolated by their own session ID.

The livestreaming session ID is same as the activity ID of the first activity in the livestreaming session.

### Informative message

> Also known as: latency loader.

Informative message is a message that will be shown to the user and is intended to describes how the bot is preparing the livestreaming session. A typical example of an informative message is "Searching your document library..."

The informative message should be a prepared message with very low latency. It should not be generated via LLMs.

## Bot implementation

Bot author would need to implement the livestreaming as outlined in this section. The implementation below will enable livestreaming to both Azure Bot Services and Teams.

### Scenario 1: Livestream from start to end

In the following example, we assume the bot is livestreaming the following sentence to the user: "A quick brown fox jumped over the lazy dogs."

First, start a [proactive messaging session](https://learn.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0).

Then, send the following activity to start the livestreaming session.

```json
{
   "channelData": {
      "streamSequence": 1,
      "streamType": "streaming"
   },
   "text": "A quick",
   "type": "typing"
}
```

Notes:

-  `text` field is required but can be an empty string
-  `type` field must be `typing`

After sending the activity, the bot must wait until the service will return the activity ID. This will be the livestreaming session ID.

In this example, we assume the service return activity ID of `"a-00001"` for the first activity.

Subsequently, send the following interim activity.

```json
{
   "channelData": {
      "streamId": "a-00001",
      "streamSequence": 2,
      "streamType": "streaming"
   },
   "text": "A quick brown fox",
   "type": "typing"
}
```

Notes:

-  `channelData.streamId` field is the livestreaming session ID, i.e. the activity ID of the first activity
   -  In this example, the first activity ID is assumed `"a-00001"`
-  `channelData.streamSequence` field should be incremented by 1 for every interim activity sent
-  `text` field should contains partial content from past interim activities
   -  `text` field in latter interim activities will replace `text` field in former interim activities
   -  Bot can use this capability to backtrack or erase response

Bots can send as much as interim activities as it needs.

To conclude the livestreaming session, send the following activity.

```json
{
   "channelData": {
      "streamId": "a-00001",
      "streamSequence": 3,
      "streamType": "final"
   },
   "text": "A quick brown fox jumped over the lazy dogs.",
   "type": "message"
}
```

Notes:

-  `channelData.streamType` field is `final`
-  `text` field should contains the complete message
-  `type` field must be `message`
-  After the session has concluded, future activities in the session will be ignored
-  This must not be the first activity in the session

### Scenario 2: With informative message

To send an [informative message](#informative-message), send the following activity.

```json
{
   "channelData": {
      "streamId": "a-00001",
      "streamSequence": 2,
      "streamType": "informative"
   },
   "text": "Searching your document library...",
   "type": "typing"
}
```

Notes:

-  `streamType` field is `informative`
-  `text` field should describes how the bot is preparing the livestream
-  `type` field must be `typing`
-  The activity can be send as the first activity or interleaved with other interim activities
   -  Some clients may not show informative messages while interleaved with other interim activities
   -  For best compatibility, send informative messages before any other interim activities
-  Latter informative messages will replace former informative messages

## Supportability

End-to-end support of livestreaming relies on the following components:

-  [Bot code](#bot-code-support)
-  [Channel](#channel-support)
-  [Client](#client-support)

### Bot code support

You can use [Microsoft Copilot Studio](https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio) to build low-code copilot with livestreaming support.

If you already have a Bot Framework bot, most existing Bot SDK versions support livestreaming. You will need to update the bot to livestream activities through the [implementation described in this document](#bot-implementation).

### Channel support

Channel support depends on the following factors:

-  Channel must support typing activity
-  Channel must return activity ID of the sent activity
-  Proactive messaging is optional but highly recommended
   -  Enabling proactive messaging will prevent client timeouts which may occur while the bot is generating the response

Known channels which supports livestreaming:

-  Direct Line (Web Socket)
-  Teams

Known channels which does not support livestreaming:

-  Direct Line (REST), does not support typing activity
-  Direct Line ASE, does not return activity ID
-  Direct Line Speech, does not return activity ID
-  Email, does not support typing activity
-  SMS, does not support typing activity

Livestreaming is resilient against:

-  Out-of-order messages: channel/client receive interim activities in wrong order and/or heavily delayed
-  Most packet loss scenarios: channel/client only received some interim activities but not all of them

### Client support

Web Chat introduced livestreaming support since version [4.17.0](../CHANGELOG.md#4170---2024-05-06). More livestreaming features are being added to Web Chat. Please read our [`CHANGELOG.md`](../CHANGELOG.md) for complete version history.
