## DirectLine/Activity Protocol Features - Complete Reference

### Core Activity Fields

| Field             | Type                                    | Description                            |
| ----------------- | --------------------------------------- | -------------------------------------- |
| `type`            | `"message"` \| `"typing"` \| `"invoke"` | Activity type                          |
| `id`              | string                                  | Unique activity identifier             |
| `timestamp`       | ISO 8601 string \| undefined            | Activity timestamp (controls ordering) |
| `text`            | string                                  | Message content                        |
| `textFormat`      | `"markdown"` \| `"plain"`               | How to render the text field           |
| `locale`          | string                                  | Language/locale (e.g., `"en-US"`)      |
| `from.id`         | string                                  | Sender identifier                      |
| `from.role`       | `"user"` \| `"bot"` \| `"channel"`      | Sender role                            |
| `from.name`       | string                                  | Display name                           |
| `replyToId`       | string                                  | Activity ID this is replying to        |
| `conversation.id` | string                                  | Conversation identifier                |
| `channelId`       | string                                  | Channel (e.g., `"directline"`)         |

---

### Attachments

| Field                       | Type             | Description                                                                                                                                                                                                                                                                                                                                         |
| --------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attachments[]`             | array            | Array of attachment objects                                                                                                                                                                                                                                                                                                                         |
| `attachments[].contentType` | MIME string      | e.g., `"image/png"`, `"video/*"`, `"text/plain"`, `"application/vnd.microsoft.card.hero"`, `"application/vnd.microsoft.card.adaptive"`, `"application/vnd.microsoft.card.oauth"`, `"application/vnd.microsoft.card.receipt"`, `"application/vnd.microsoft.card.audio"`, `"application/vnd.openxmlformats-officedocument.wordprocessingml.document"` |
| `attachments[].content`     | object \| string | Card content or text content                                                                                                                                                                                                                                                                                                                        |
| `attachments[].contentUrl`  | URL string       | URL for media attachments                                                                                                                                                                                                                                                                                                                           |
| `attachments[].name`        | string           | File name for downloads                                                                                                                                                                                                                                                                                                                             |

---

### Suggested Actions

| Field                                     | Type                                                         | Description         |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------- |
| `suggestedActions.to[]`                   | string[]                                                     | Target user IDs     |
| `suggestedActions.actions[]`              | array                                                        | Action buttons      |
| `suggestedActions.actions[].type`         | `"imBack"` \| `"postBack"` \| `"messageBack"` \| `"openUrl"` | Action type         |
| `suggestedActions.actions[].title`        | string                                                       | Button text         |
| `suggestedActions.actions[].value`        | string \| object                                             | Value sent on click |
| `suggestedActions.actions[].text`         | string                                                       | Text sent to bot    |
| `suggestedActions.actions[].displayText`  | string                                                       | Text shown in chat  |
| `suggestedActions.actions[].image`        | URL/data URI                                                 | Button icon         |
| `suggestedActions.actions[].imageAltText` | string                                                       | Icon alt text       |

---

### Live Streaming (channelData)

| Field                        | Type                                          | Description                        |
| ---------------------------- | --------------------------------------------- | ---------------------------------- |
| `channelData.streamType`     | `"streaming"` \| `"informative"` \| `"final"` | Stream phase                       |
| `channelData.streamSequence` | number                                        | Revision order (1, 2, 3...)        |
| `channelData.streamId`       | string                                        | Original activity ID being updated |

**Note:** Streaming can alternatively use `entities[].type: "streaminfo"` with same fields.

---

### Send Status (channelData)

| Field                                | Type                                       | Description                             |
| ------------------------------------ | ------------------------------------------ | --------------------------------------- |
| `channelData.state`                  | `"sending"` \| `"sent"` \| `"send failed"` | Outgoing message lifecycle              |
| `channelData['webchat:send-status']` | `"sending"` \| `"send failed"`             | WebChat-specific send status            |
| `channelData.attachmentSizes`        | number[]                                   | Array of attachment file sizes in bytes |

---

### Feedback Loop (channelData)

| Field                                 | Type        | Description                            |
| ------------------------------------- | ----------- | -------------------------------------- |
| `channelData.feedbackLoop.type`       | `"default"` | Feedback type                          |
| `channelData.feedbackLoop.disclaimer` | string      | Disclaimer text shown in feedback form |

---

### Schema.org Entities (entities[])

#### Message Entity

| Field                       | Type                           | Description                                   |
| --------------------------- | ------------------------------ | --------------------------------------------- |
| `entities[].@context`       | `"https://schema.org"`         | Schema context                                |
| `entities[].@id`            | string                         | Entity identifier                             |
| `entities[].@type`          | `"Message"`                    | Entity type                                   |
| `entities[].type`           | `"https://schema.org/Message"` | Full type URI                                 |
| `entities[].keywords`       | string[]                       | Feature flags (see below)                     |
| `entities[].additionalType` | string[]                       | e.g., `["WebPage"]`, `["AIGeneratedContent"]` |

**Keywords feature flags:**

- `"AllowCopy"` — enables Copy button
- `"AIGeneratedContent"` — marks as AI-generated
- `"AnalysisMessage"` — analysis message style
- `"Collapsible"` — makes message collapsible/foldable
- `"PreChatMessage"` — renders as pre-chat card

---

#### Collapsible/Part-Grouping Fields

| Field                           | Type                            | Description                            |
| ------------------------------- | ------------------------------- | -------------------------------------- |
| `entities[].abstract`           | string                          | Summary text for collapsible header    |
| `entities[].position`           | number                          | Step ordering (1, 2, 3, 4)             |
| `entities[].isPartOf`           | object                          | Groups activities into sequences       |
| `entities[].isPartOf.@id`       | string                          | Group identifier (e.g., `"_:h-00001"`) |
| `entities[].isPartOf.@type`     | `"HowTo"`                       | Group type                             |
| `entities[].creativeWorkStatus` | `"Incomplete"` \| `"Published"` | Step completion status                 |

---

#### Code Content (View Code Button)

| Field                                      | Type                   | Description                      |
| ------------------------------------------ | ---------------------- | -------------------------------- |
| `entities[].isBasedOn`                     | object \| array        | Code sources                     |
| `entities[].isBasedOn.@type`               | `"SoftwareSourceCode"` | Code type                        |
| `entities[].isBasedOn.programmingLanguage` | string                 | e.g., `"python"`, `"javascript"` |
| `entities[].isBasedOn.text`                | string                 | Source code content              |

---

#### Author Information

| Field                           | Type                   | Description                         |
| ------------------------------- | ---------------------- | ----------------------------------- |
| `entities[].author`             | object                 | Message author                      |
| `entities[].author.@context`    | `"https://schema.org"` | Schema context                      |
| `entities[].author.@type`       | `"Person"`             | Author type                         |
| `entities[].author.name`        | string                 | Author name                         |
| `entities[].author.image`       | URL                    | Avatar URL                          |
| `entities[].author.description` | string                 | Author description (pre-chat cards) |

---

#### Claim Entity (Citations)

| Field                                | Type             | Description                        |
| ------------------------------------ | ---------------- | ---------------------------------- |
| `entities[].@type`                   | `"Claim"`        | Citation entity type               |
| `entities[].@id`                     | string           | e.g., `"cite:1"`                   |
| `entities[].name`                    | string           | Citation display name              |
| `entities[].text`                    | string           | Citation content                   |
| `entities[].position`                | string \| number | Citation position                  |
| `entities[].claimInterpreter`        | object           | Source information                 |
| `entities[].claimInterpreter.@type`  | `"Project"`      | Interpreter type                   |
| `entities[].claimInterpreter.slogan` | string           | e.g., `"Surfaced by Azure OpenAI"` |
| `entities[].claimInterpreter.url`    | URL              | Attribution link                   |

---

#### Citation Array (within Message entity)

| Field                                                         | Type                | Description                    |
| ------------------------------------------------------------- | ------------------- | ------------------------------ |
| `entities[].citation[]`                                       | array               | Array of citations             |
| `entities[].citation[].@type`                                 | `"Claim"`           | Citation type                  |
| `entities[].citation[].position`                              | number              | Display position               |
| `entities[].citation[].appearance`                            | object              | Citation appearance            |
| `entities[].citation[].appearance.@type`                      | `"DigitalDocument"` | Document type                  |
| `entities[].citation[].appearance.url`                        | URL                 | Source URL                     |
| `entities[].citation[].appearance.text`                       | string              | Document content               |
| `entities[].citation[].appearance.name`                       | string              | Document title                 |
| `entities[].citation[].appearance.usageInfo`                  | object              | Sensitivity/usage metadata     |
| `entities[].citation[].appearance.usageInfo.@type`            | `"CreativeWork"`    | Usage type                     |
| `entities[].citation[].appearance.usageInfo.name`             | string              | Sensitivity label name         |
| `entities[].citation[].appearance.usageInfo.description`      | string              | Label description              |
| `entities[].citation[].appearance.usageInfo.keywords`         | string[]            | e.g., `["encrypted-content"]`  |
| `entities[].citation[].appearance.usageInfo.pattern.termCode` | string              | Badge color (e.g., `"orange"`) |

---

#### Feedback Actions (potentialAction)

| Field                                                                    | Type                                                   | Description                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------- |
| `entities[].potentialAction[]`                                           | array                                                  | Feedback actions                                    |
| `entities[].potentialAction[].@type`                                     | `"LikeAction"` \| `"DislikeAction"`                    | Action type                                         |
| `entities[].potentialAction[].actionStatus`                              | `"PotentialActionStatus"` \| `"CompletedActionStatus"` | Current status                                      |
| `entities[].potentialAction[].target`                                    | object                                                 | Action endpoint                                     |
| `entities[].potentialAction[].target.@type`                              | `"EntryPoint"`                                         | Target type                                         |
| `entities[].potentialAction[].target.urlTemplate`                        | string                                                 | e.g., `"ms-directline://postback?interaction=like"` |
| `entities[].potentialAction[].result`                                    | object                                                 | DislikeAction feedback form                         |
| `entities[].potentialAction[].result.@type`                              | `"Review"`                                             | Result type                                         |
| `entities[].potentialAction[].result.reviewBody`                         | string                                                 | Default feedback text                               |
| `entities[].potentialAction[].result['reviewBody-input']`                | object                                                 | Input specification                                 |
| `entities[].potentialAction[].result['reviewBody-input'].@type`          | `"PropertyValueSpecification"`                         | Spec type                                           |
| `entities[].potentialAction[].result['reviewBody-input'].valueMinLength` | number                                                 | Minimum input length                                |
| `entities[].potentialAction[].result['reviewBody-input'].valueName`      | string                                                 | Input field name                                    |

---

### Model Context Protocol (MCP) Apps

| Field                                                                                  | Type                                                                      | Description                        |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------- |
| `entities[].encodingFormat`                                                            | `"text/html;profile=mcp-app"`                                             | MCP HTML rendering format          |
| `entities[].additionalType`                                                            | `["WebPage"]`                                                             | Marks as web page content          |
| `entities[].isPartOf[]`                                                                | array                                                                     | Tool invocation info               |
| `entities[].isPartOf[].@type`                                                          | `["HowToTool", "urn:microsoft:webchat:model-context-protocol:call-tool"]` | Tool types                         |
| `entities[].isPartOf[].name`                                                           | string                                                                    | Tool name (e.g., `"show-weather"`) |
| `entities[].isPartOf[].url`                                                            | URL                                                                       | MCP server endpoint                |
| `entities[].'urn:microsoft:webchat:model-context-protocol:call-tool:input'`            | object                                                                    | Tool input parameters              |
| `entities[].'urn:microsoft:webchat:model-context-protocol:call-tool:result'`           | object                                                                    | Tool result data                   |
| `entities[].'urn:microsoft:webchat:model-context-protocol:call-tool:result'._meta`     | object                                                                    | Metadata for rendering             |
| `entities[].'urn:microsoft:webchat:model-context-protocol:call-tool:result'.content[]` | array                                                                     | Result content                     |

---

### Invoke Activity (Feedback)

| Field                                     | Type                     | Description          |
| ----------------------------------------- | ------------------------ | -------------------- |
| `type`                                    | `"invoke"`               | Invoke activity type |
| `name`                                    | `"message/submitAction"` | Action name          |
| `value.actionName`                        | `"feedback"`             | Action identifier    |
| `value.actionValue.reaction`              | `"like"` \| `"dislike"`  | User reaction        |
| `value.actionValue.feedback.feedbackText` | string                   | User feedback text   |

---

### Streaming Entity Format (Alternative)

| Field                       | Type                                          | Description               |
| --------------------------- | --------------------------------------------- | ------------------------- |
| `entities[].type`           | `"streaminfo"`                                | Streaming metadata entity |
| `entities[].streamType`     | `"streaming"` \| `"informative"` \| `"final"` | Stream phase              |
| `entities[].streamSequence` | number                                        | Revision number           |
