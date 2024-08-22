# Livestreaming

This document describes how to livestreaming works in Web Chat.

## Background

As livestreaming is becoming more popular for bot that use LLMs to generate response. Web Chat also added support of livestreaming since version 4.17.0.

## Terminology

### Livestreaming session

> Also known as: streaming response.

A single bot, at its turn, can livestream multiple activities simultaneously each with their own content. Each livestream will have their own session. The livestream session ID is the activity ID of the first activity in the livestream session.

### Informative message

> Also known as: latency loader.

Informative message is a message that will shown to the user and is intended to describes the bot is preparing the livestreaming session. A typical example of informative message is "Searching your document library..."

The informative message should be a canned message and not being generated via LLMs.

## Implementation

Bot author would need to implement the livestreaming as outlined in this section. The implementation below will enable livestreaming to both Azure Bot Services and Teams.

### Scenario 1: Livestream from start to end

In the following example, we assume the bot is livestreaming the following sentence to the user: "A quick brown fox jumped over the lazy dogs."

First, start a [proactive messaging session](https://learn.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0). Then, send the following activity to start the livestream session.

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

After sending the activity, the service will return activity ID. This will be the livestream session ID. In this example, we assume the service return activity ID of `"a-00001"`.

Subsequently, send the following interim activities.

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

-  `channelData.streamId` field is the activity ID of the first activity
-  `channelData.streamSequence` field will be increase by 1 for every interim activity sent
-  `text` field should contains partial content from previous livestream

When reaching completion, send the following activity.

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
-  `text` field contains the complete message
-  `type` field must be `message`

### Scenario 2: With informative message

To send an [informative message](#informative-message) to indicate the LLM is preparing the answer, send the following activity.

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
-  The activity can be send as the first activity or while the livestreaming session is ongoing

## Supportability

Livestreaming support are based on 3 components:

-  [Bot code](#bot-code-support)
-  [Channel](#channel-support)
-  [Client](#client-support)

### Bot code support

You can use [Microsoft Copilot Studio](https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio) to build low-code copilot with livestreaming support.

If you already have a Bot Framework bot, most existing Bot SDK versions support livestreaming. You will need to update the bot to livestream activities through the [implementation](#implementation) described in this document.

### Channel support

Channel support depends on a few factors:

-  Channel must support typing activity
-  Channel must return activity ID of the sent activity
-  Proactive messaging is optional but highly recommended
   -  Enabling proactive messaging will prevent client timeouts which may occur while the bot is generating the response

Example of channels that support livestreaming: Direct Line (via Web Socket), Teams, etc.

Example of channels that do not support livestreaming: Direct Line (via REST), Direct Line ASE, Direct Line Speech, email, SMS, etc.

### Client support

Web Chat introduced livestreaming support since version 4.17.0. More livestreaming features are being added to Web Chat. Please read our [`CHANGELOG.md`](/tree/main/CHANGELOG.md) for complete version history.
