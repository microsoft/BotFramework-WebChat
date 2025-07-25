# Livestreaming

This document describes how livestreaming works in Web Chat.

## Background

Livestreaming is a popular technique to improve user experience (UX) for bots/copilots that use large-language models (LLM) to generate response.

Web Chat added livestreaming support since version [4.17.0](../CHANGELOG.md#4170---2024-05-06).

## Terminology

### Livestreaming

> Also known as: streaming response.

Livestreaming means progressively sending an activity. It is usually progressively concatenating until the full response is made.

Livestreaming is one-off and should not be replayed.

### A livestream

> Also known as: livestreaming session.

A single bot, at its turn, can livestream multiple activities simultaneously each with their own content. Each livestream will be isolated by their own session ID.

The session ID is same as the activity ID of the first activity in the livestream.

### Interim activities

> Also known as: chunk.

Interim activities are the activities of the partial response from the bot. Its content often become part of the final/complete response.

### Informative message

> Also known as: latency loader.

Informative message is a side-channel message that will be shown to the user and is intended to describes how the bot is preparing the livestream. A typical example of an informative message is "Searching your document library..."

For better UX, the informative message should be a prepared message with very low latency. It should not be generated via LLMs.

### Ephemeral message

> Also known as: temporary message.

Ephemeral message means the content should only be available for a limited time and should not be considered final. Interim activities are naturally ephemeral message.

### Concluded livestream

> Also known as: finalized livestream.

When a livestream has finished, it will be marked as closed and sealed against future updates. The said livestream is a concluded livestream.

### Bot vs. copilot

> This is _not_ an official statement from Microsoft.

In Web Chat, bot is the general terms for chatbot. Copilot is a bot with generative AI and modern features. In other words, copilot is a modern bot.

To simplify this documentation, we are using the term "bot" instead of "copilot". But they can be used interchangeably in this documentation.

## Bot implementation

Bot developers would need to implement the livestreaming as outlined in this section. The implementation below will enable livestreaming to both Azure Bot Services and Teams.

> [!NOTE]
> In the scenarios below, the livestream metadata is inside the `channelData` field. BotFramework-WebChat checks both `channelData` and the first element of the `entities` field for livestreaming metadata. It will appear in different places depending on the platform used to communicate with BotFramework-WebChat

### Scenario 1: Livestream from start to end

> In this example, we assume the bot is livestreaming the following sentence to the user:
>
> "A quick brown fox jumped over the lazy dogs."

First, start a [proactive messaging session](https://learn.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0). Although not required, proactive messaging is highly recommended to prevent client timeouts.

Then, send the following activity to start the livestream.

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

- `text` field is required but can be an empty string
   - In this example, the bot is sending "A quick" as its being prepared by LLMs
- `type` field must be `typing`

After sending the activity, the bot must wait until the service will return the activity ID. This will be the session ID of the livestream.

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

- `channelData.streamId` field is the session ID, i.e. the activity ID of the first activity
   - In this example, the first activity ID is assumed `"a-00001"`
   - The session ID must be unique within the conversation
- `channelData.streamSequence` field should be incremented by 1 for every activity sent in the livestream
- `text` field should contains partial content from past interim activities
   - `text` field in latter interim activities will replace `text` field in former interim activities
   - Bot can use this capability to backtrack or erase response

Bots can send as much interim activities as it needs.

To conclude the livestream, send the following activity.

```json
{
   "channelData": {
      "streamId": "a-00001",
      "streamType": "final"
   },
   "text": "A quick brown fox jumped over the lazy dogs.",
   "type": "message"
}
```

Notes:

- `channelData.streamType` field is `final`
- `channelData.streamSequence` field should not be present, and assumed `Infinity`
- `text` field should contains the complete message
- `type` field must be `message`
- After the livestream has concluded, future activities for the livestream will be ignored
- This must not be the first activity in the livestream
- For best compatibility, do not send attachments or anything other than the `text` field

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

- `channelData.streamType` field is `informative`
- `text` field should describes how the bot is preparing the livestream
- `type` field must be `typing`
- The activity can be send as the first activity or interleaved with other interim activities
   - Some clients may not show informative messages while interleaved with other interim activities
   - For best compatibility, send informative messages before any other interim activities
- Latter informative messages will replace former informative messages

### Scenario 3: Interim activities with no content

> New since 2025-02-25.

Traditionally, no bubbles will show for activities which do not have any text content or attachments, they are called contentless activity. For contentless activity in livestream, Web Chat will show typing indicator in lieu of message bubble.

Contentless activities can appear in all phase of a livestream, including: start, middle, and end of the livestream.

```json
{
   "channelData": {
      "streamSequence": 1,
      "streamType": "streaming"
   },
   "type": "typing"
}
```

Notes:

- `text` field can be either unset or an empty string
- `attachments` field is not set or is an empty array
- Web Chat will show a typing indicator
   - The typing indicator will always appear until this livestream is concluded
- Only activity without `text` and `attachments` are considered contentless activity
   - Activities filtered out by activity and attachment middleware are not considered contentless and will not show typing indicators
      - This behavior may change in the future, middleware may be taken into account when considering an activity is contentless or not

Final activity can be contentless. Upon the conclusion of the livestream with a contentless activity, message bubble related to the livestream will be removed. This is also called "regretting the livestream" and allows the bot to erase the response before concluding it.

```json
{
   "channelData": {
      "streamSequence": "a-00001",
      "streamType": "final"
   },
   "type": "typing"
}
```

Notes:

- `text` field can be either unset or an empty string
- `type` should be `typing`
   - In some systems, activities with `type` of `message` requires `text` field to also be set
   - For best compatibility, we recommend setting the `type` to `typing` and `text` field unset
- If message bubble was shown, it will be removed
   - Traditionally, no bubbles will show for contentless activity
- If typing indicator was shown, it will be removed

## Supportability

End-to-end support of livestreaming relies on the following components:

- [Bot code](#bot-code-support)
- [Channel](#channel-support)
- [Client](#client-support)

### Bot code support

You can use [Microsoft Copilot Studio](https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio) to build low-code copilot with livestreaming support.

If you already have a Bot Framework bot, most existing Bot SDK versions support livestreaming. You will need to update the bot to livestream activities through the [implementation described in this document](#bot-implementation).

### Channel support

Channel support depends on the following factors:

- Channel must support typing activity
- Channel must return activity ID of the sent activity
- Proactive messaging is optional but highly recommended
   - Enabling proactive messaging will prevent client timeouts which may occur while the bot is generating the response

Known channels which supports livestreaming:

- Direct Line (Web Socket)
- Teams

Known channels which does not support livestreaming:

- Direct Line (REST): ignores typing activity
- Direct Line ASE: does not return activity ID
- Direct Line Speech: does not return activity ID
- Email: ignores typing activity
- SMS: ignores typing activity

### Client support

Web Chat introduced livestreaming support since version [4.17.0](../CHANGELOG.md#4170---2024-05-06). More livestreaming features are being added to Web Chat. Please read our [`CHANGELOG.md`](../CHANGELOG.md) for complete version history.

## Design decisions

### Out-of-order messages

#### Background

- Assumption: interim activities can be sent as frequently as every 10 ms (100 Hz)
- ABS is a distributed system and may receive bot activity in an out-of-order fashion
   - Every interim activities could send to a different HTTP endpoints
   - In a distributed environment, the time receiving the HTTP request could differs

#### Solutions

- `channelData.streamSequence` will be used to identify obsoleted (outdated) activities
- Once the livestream has concluded, all future activities should be ignored

### Packet loss or join after livestream started

#### Background

- Client may join the conversation after livestream started
- Some services may drop typing activities as it has a lower quality-of-service (QoS) priority

#### Solutions

- Content in interim activities should be overlapping
   - Former interim activities will be obsoleted by latter interim activities
   - The latest round of interim activities is sufficient to catchup the livestream
- Side benefits: bot can backtrack and erase response

Bottomline: we understand the bandwidth usage could be large. But the benefits outweighted the shortcomings. Transports are free to implement their own mechanisms to save bandwidth.

### Channel and transport support

#### Background

- Reduce/eliminate the need to update existing channel/transport/service
   - 3P channel devs may have existing channel adapter that could be impacted by livestreaming
- Resource-heavy channels should not handle livestream
   - Livestream should be ignored by SMS channel and Direct Line (REST) channel
- Unsupported channels should ignore livestream

#### Solutions

- Typing activity is being used to send interim activities
   - According to [Direct Line specification](https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#typing-activity): "Typing activities represent ongoing input from a user or a bot."
   - We are leveraging existing typing activity to send interims, channel/transport/service would not need an update
- Typing activity is naturally ignored by SMS, email, and other plain text channels
- Direct Line (REST) is a resource-heavy channel and livestreaming should be ignored
   - Typing activity is naturally ignored by Direct Line (REST) channel to save resources
- Final activity in the livestream is sent as a normal message activity
   - Channels that does not support livestreaming will be able to handle the final activity
- Side benefits: bot do not need a major update to use the livestreaming feature

### Guaranteed start of livestream

#### Background

- Some services requires a very clear signal to start a livestream
- Out-of-order delivery could affect this start of livestream signal

#### Solutions

- Bot would need to wait until the service replies with an activity ID
   - The response from the service is a clear signal that the service has created a livestream
- Side benefits: the activity ID is an opaque string and can be used as the session ID

### Storing of interim activities

#### Background

- Some services may need to store every interim activities being sent
   - Service implementation which concatenate interim activities in an out-of-order fashion could be very complex

#### Solutions

- Interim activities will send overlapping content
   - Services would not need to concatenate content itself

### No replay

#### Background

- Restoring chat history should not replay the livestreaming
   - The final activity should be displayed instantly, interim activities should be skipped

#### Solutions

- Typing activity for all activities during a livestream
   - Direct Line channel saves chat history without typing activities

### Text format change

#### Background

- Text format could change during interim activities
   - This could cause layout to change rapidly and degrade UX

#### Solutions

- Text format is assumed to be Markdown during the livestream

### Adding attachments during livestream

#### Background

- Some clients may have difficulties handling attachments during livestream

#### Solutions

- As of this writing, no consensus has been reached on this issue
- For best compatibility, bot should only send attachments in final activity

### Concluding the livestream without content

#### Background

- Some bots may regret that they opened a livestream and prefer to conclude it without any contents
- Some systems requires `text` to be set to a non-empty string for activities with `type` of `message`

#### Solutions

- To conclude a livestream without any contents, send the final message with `type` set to `typing`, with `text` either unset or set to an empty string
   - For best compatibility, bot should not use `type` of `message` with empty `text` field
   - Some systems cannot handle message activity without content

## Frequently asked questions

### Why an activity is not part of the livestream?

Please verify the activity payload against the logic in [this file](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/core/src/utils/getActivityLivestreamingMetadata.ts). If the result is `undefined`, the activity is not part of a livestream. They could be missing required fields or failed some type validations.
