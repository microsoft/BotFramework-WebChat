- the OAI side is `POST /v1/chat/completions`, with streaming delivered as SSE `data: {json}` chunks ending in `data: [DONE]`; chunks use `choices[].delta`, may stream `tool_calls`, may include an extra usage chunk when `stream_options.include_usage` is enabled, and llama.cpp adds request fields like `chat_template_kwargs`, `reasoning_format`, `thinking_forced_open`, `parse_tool_calls`, vendor sampling fields, plus response fields like `delta.reasoning_content` and `timings`.
- the DL side gives you `message` / `typing` / `invoke` activities, streaming metadata via `channelData.streamType|streamSequence|streamId` or `entities[].type: "streaminfo"`, message entities with keywords like `AllowCopy`, `AnalysisMessage`, `Collapsible`, `HowTo` grouping via `isPartOf` + `position` + `creativeWorkStatus`, suggested actions, citation entities, MCP-app entities, and feedback invoke payloads.

## 1) Design decisions up front

### A. Use an internal canonical model, not raw DL or raw OAI

Do not directly translate “wire object to wire object.”
Instead define an internal turn model:

- `TranscriptItem`
- `PendingAssistantTurn`
- `ToolInvocation`
- `ToolResult`
- `ReasoningStep`
- `UiMutation`

That gives you a stable place to support:

- plain assistant text
- streamed reasoning paragraphs
- OAI tool calls
- llama.cpp `reasoning_content`
- adapter-owned UI mutation tools
- MCP tool execution
- final DL rendering

### B. Treat DL `typing` as **streaming revisions**, but finalize as `message`

Your user requirement says SSE should become typing activities. I would do:

- intermediate chunks → `typing`
- completed reasoning paragraphs → `typing` with HowTo metadata
- final visible assistant answer → `message`

Reason: `typing` is the right place for “still generating,” but citations / suggested actions / feedback / MCP cards belong on a final message envelope. DL explicitly supports streaming phases via `channelData.streamType`, `streamSequence`, and `streamId`.

### C. Do **not** expose raw custom `type: "mcp"` to generic DL clients by default

The DL reference you provided only lists `message`, `typing`, and `invoke` as core activity types.

So I would use:

- **internal canonical type**: `mcp`
- **wire projection for generic DL clients**: `message` with MCP entities
- **optional custom wire mode**: emit `type: "mcp"` only if your client explicitly opts in

That keeps transcript semantics clean without breaking existing DL renderers.

## 2) High-level architecture

```text
DL Client
  -> postActivity(activity)
    -> Adapter
       -> ConversationStore
       -> TranscriptSerializer (DL -> OAI messages)
       -> ToolRegistry
       -> CompletionRunner
          -> OAI /v1/chat/completions (stream=true)
          -> SSE parser
          -> Stream assembler
          -> Tool orchestrator
       -> DlActivityProjector (internal -> DL activities)
       -> ActivitySink / Transcript stream
```

Core modules:

1. **ConversationStore**
   - persists transcript items
   - stores per-conversation config overrides
   - stores tool results and usage metadata

2. **TranscriptSerializer**
   - converts persisted DL-side transcript into OAI `messages[]`
   - injects configured `developer` / `system` instructions first
   - omits transient typing revisions from model history

3. **CompletionRunner**
   - opens one SSE request per model round
   - assembles content / reasoning / tool calls
   - loops if finish reason is `tool_calls`

4. **ToolOrchestrator**
   - executes adapter-owned tools
   - executes MCP tools
   - appends assistant tool-call + tool-result messages back into OAI history
   - starts next completion round

5. **DlActivityProjector**
   - emits `typing` during streaming
   - emits final `message`
   - attaches citations / suggested actions / feedback / author / keywords / MCP entities

## 3) Adapter instantiation config

```ts
interface AdapterConfig {
   openai: {
      baseUrl: string;
      apiKey?: string;
      model: string;
      developerMessage?: string | OAIContentPart[];
      systemMessage?: string | OAIContentPart[];
      defaultRequest: {
         temperature?: number;
         top_p?: number;
         max_completion_tokens?: number;
         stop?: string | string[];
         response_format?: unknown;
         parallel_tool_calls?: boolean;
         logprobs?: boolean;

         // llama.cpp extensions
         chat_template_kwargs?: Record<string, unknown>;
         reasoning_format?: string;
         thinking_forced_open?: boolean;
         parse_tool_calls?: boolean;
         mirostat?: number;
         [vendorKey: string]: unknown;
      };
   };

   directLine: {
      botId: string;
      botName?: string;
      channelId?: string; // default "directline"
      authorEntity?: {
         name?: string;
         image?: string;
         description?: string;
      };
      messageKeywords?: {
         final?: string[]; // e.g. ["AllowCopy", "AIGeneratedContent"]
         reasoning?: string[]; // e.g. ["AnalysisMessage", "Collapsible"]
      };
      feedback?: {
         enabled: boolean;
         disclaimer?: string;
      };
      hints?: {
         enabled: boolean;
         maxKeywords?: number;
      };
   };

   behavior: {
      maxToolRounds: number;
      maxParallelToolCalls: number;
      reasoningParagraphSplit: 'blank-line';
      emitUsageMetadata: boolean;
      emitTimingsMetadata: boolean;
      enableCustomMcpActivityWireFormat: boolean;
   };

   tools: {
      mcp: McpToolRegistry;
      uiMutation: UiMutationToolRegistry;
   };
}
```

The llama.cpp-specific request extensions belong in `defaultRequest`, because the provided spec explicitly calls out `chat_template_kwargs`, `reasoning_format`, `thinking_forced_open`, `parse_tool_calls`, vendor sampling controls, and optional `parallel_tool_calls`.

## 4) Canonical internal transcript model

Use a model richer than either protocol.

```ts
type TranscriptItem =
   | UserMessageItem
   | AssistantMessageItem
   | ReasoningStepItem
   | ToolCallItem
   | ToolResultItem
   | UiMutationItem
   | FeedbackItem
   | ErrorItem;

interface BaseItem {
   id: string;
   conversationId: string;
   createdAt: string;
   replyToId?: string;
   source: 'client' | 'adapter' | 'model' | 'tool';
}

interface UserMessageItem extends BaseItem {
   kind: 'user_message';
   text?: string;
   attachments?: DlAttachment[];
   locale?: string;
}

interface AssistantMessageItem extends BaseItem {
   kind: 'assistant_message';
   text: string;
   citations?: Citation[];
   suggestedActions?: SuggestedAction[];
   hints?: Hint[];
   feedbackEnabled?: boolean;
   author?: AuthorEntity;
   usage?: Usage;
   timings?: LlamaTimings;
}

interface ReasoningStepItem extends BaseItem {
   kind: 'reasoning_step';
   groupId: string; // HowTo group
   position: number;
   text: string;
   status: 'Incomplete' | 'Published';
}

interface ToolCallItem extends BaseItem {
   kind: 'tool_call';
   toolCallId: string;
   toolName: string;
   argsText: string;
   argsJson?: unknown;
   vendor?: 'openai' | 'llama.cpp';
}

interface ToolResultItem extends BaseItem {
   kind: 'tool_result';
   toolCallId: string;
   toolName: string;
   result: unknown;
   renderAsMcp?: boolean;
}

interface UiMutationItem extends BaseItem {
   kind: 'ui_mutation';
   targetMessageId: string;
   mutation:
      | { op: 'set_suggested_actions'; actions: SuggestedAction[] }
      | { op: 'set_citations'; citations: Citation[] }
      | { op: 'set_hints'; hints: Hint[] };
}
```

## 5) DL → OAI conversion plan

### 5.1 What becomes OAI `messages[]`

Build OAI `messages[]` in this order:

1. configured `developer` message, if present
2. configured `system` message, if present
3. transcript items serialized chronologically
4. current user activity as the last `user` message

Supported OAI roles in your spec are `developer`, `system`, `user`, `assistant`, and `tool`.

### 5.2 Serialization rules

#### User message activity → OAI `user`

DL `message` from `from.role = user` maps to:

```json
{ "role": "user", "content": "..." }
```

or to typed content parts if image attachments exist. Your OAI spec allows typed content parts including `text` and `image_url`, and llama.cpp supports `image_url` including base64 data. DL attachments have `contentType`, `content`, `contentUrl`, and `name`.

Implementation:

- text only → plain string content
- text + image attachments → `content: [{type:"text"...}, {type:"image_url"...}]`
- non-image attachments → either:
   - convert to text/plain if feasible
   - or omit from model input and keep only in transcript metadata

#### Assistant final message → OAI `assistant`

Only finalized assistant messages go back into model history.

Do **not** serialize transient `typing` revisions, because they are presentational and would duplicate the assistant turn.

#### Internal tool-call item → OAI `assistant` with `tool_calls`

When a prior round ended with tool calls, serialize the assistant decision back as:

```json
{
  "role": "assistant",
  "tool_calls": [...]
}
```

#### Internal tool-result item → OAI `tool`

Serialize tool results as:

```json
{
   "role": "tool",
   "tool_call_id": "...",
   "content": "..."
}
```

That aligns with the OAI role set in your spec and with streamed tool-call assembly rules.

#### Feedback invoke → not sent to model by default

DL feedback is an `invoke` activity with `name: "message/submitAction"` and `value.actionName: "feedback"`.

Default rule:

- persist feedback separately
- do not send into OAI history
- optionally turn into analytics or RLHF logs

## 6) OAI request composition

For each model round:

```json
{
  "model": "...",
  "stream": true,
  "stream_options": { "include_usage": true },
  "messages": [...],
  "tools": [...],
  "tool_choice": "auto",
  "parallel_tool_calls": true,

  "...inference settings...",
  "...llama.cpp extensions..."
}
```

Why:

- SSE streaming is required for the bridge design.
- usage may be emitted in a final extra chunk with `choices: []`.
- `tools`, `tool_choice`, `parallel_tool_calls`, `response_format`, and inference controls are all listed as accepted compatibility inputs.
- llama.cpp-specific fields should be included opportunistically.

### 6.1 Tool list composition

The adapter should merge two tool namespaces:

1. **MCP tools**
   - real external tools
   - usually visible in transcript

2. **UI mutation tools**
   - local adapter tools
   - mutate the pending final message
   - not rendered as standalone user-visible tools unless debugging

Recommended names:

- `ui.set_suggested_actions`
- `ui.set_citations`
- `ui.set_hints`

These are plain OAI tools from the model’s perspective.

## 7) OAI SSE → DL streaming plan

### 7.1 Per-postActivity execution model

Because one `/v1/chat/completions` request processes one streamed assistant turn, but tools may require further model continuation, implement a **round loop**:

```text
postActivity(user message)
  -> round 1 OAI stream
     -> if stop/length/content_filter => finalize
     -> if tool_calls => execute tools, append tool results
  -> round 2 OAI stream
     -> ...
```

This is required because streamed chunks may end with `finish_reason: "tool_calls"`, and tool-call arguments must be concatenated by tool index before execution.

### 7.2 Stream state object

```ts
interface PendingAssistantTurn {
   rootStreamId: string;
   sourceUserActivityId: string;
   replyToId: string;

   visibleText: string;
   reasoningText: string;
   reasoningSteps: ReasoningStepBuffer[];

   toolCalls: Map<number, AssembledToolCall>;
   citations: Citation[];
   suggestedActions: SuggestedAction[];
   hints: Hint[];

   usage?: Usage;
   timings?: LlamaTimings;
   finishReason?: string;
   streamSequence: number;
}
```

### 7.3 Chunk handling rules

For each SSE `data:` event:

1. parse JSON unless `[DONE]`
2. ignore unknown top-level fields
3. for each `choices[i]`:
   - append `delta.content` to `visibleText`
   - append `delta.reasoning_content` to `reasoningText`
   - merge `delta.tool_calls` fragments by `tool_call.index`
   - if `finish_reason != null`, mark round terminal

4. if chunk has `usage`, store it
5. if chunk has `timings`, store it

These rules follow the provided parser guidance and llama.cpp extension notes.

### 7.4 Emitting DL `typing` revisions

For every meaningful visible-text delta:

- emit `typing`
- `channelData.streamType = "streaming"`
- `channelData.streamSequence++`
- `channelData.streamId = rootStreamId`
- `replyToId = source user activity id`
- `text = accumulated visibleText`

DL supports exactly those streaming fields.

I would throttle emission:

- every N characters or
- every 50–100 ms or
- on punctuation / paragraph boundary

That avoids chatty activity floods.

## 8) Reasoning → HowTo entries plan

The llama.cpp side may stream reasoning separately in `delta.reasoning_content`.

Your requirement says reasoning must break into multiple HowTo entries based on paragraphs. DL supports:

- `AnalysisMessage`
- `Collapsible`
- `isPartOf.@type = "HowTo"`
- `position`
- `creativeWorkStatus`
- `abstract` summary text.

### 8.1 Paragraph splitting algorithm

Use blank-line paragraph splitting on the accumulated reasoning buffer:

- current open paragraph = text since last `\n\n`
- once a paragraph closes, seal it as a reasoning step
- publish it as step `position = n`
- mark finished steps `Published`
- keep the current incomplete paragraph as `Incomplete`

### 8.2 DL projection for reasoning steps

Emit each reasoning paragraph as a separate `typing` activity:

```json
{
   "type": "typing",
   "text": "Reasoning paragraph text",
   "replyToId": "<user activity id>",
   "channelData": {
      "streamType": "informative",
      "streamSequence": 7,
      "streamId": "<rootStreamId>"
   },
   "entities": [
      {
         "@context": "https://schema.org",
         "@type": "Message",
         "type": "https://schema.org/Message",
         "keywords": ["AnalysisMessage", "Collapsible"],
         "abstract": "Short summary",
         "position": 2,
         "isPartOf": {
            "@id": "_:howto-<rootStreamId>",
            "@type": "HowTo"
         },
         "creativeWorkStatus": "Published"
      }
   ]
}
```

This is a very natural fit for the provided DL entity model.

## 9) Tool-call orchestration plan

### 9.1 Assembly

Your OAI spec says streamed tool-call fragments must be concatenated by:

- choice index
- tool call index
  and arguments are streamed text that may be invalid JSON until fully assembled.

So implement:

```ts
Map<
   choiceIndex,
   Map<
      toolIndex,
      {
         id?: string;
         type?: string;
         name?: string;
         argumentsText: string;
      }
   >
>;
```

At `finish_reason = "tool_calls"`:

- freeze assembly
- parse `argumentsText`
- validate against tool schema
- execute

### 9.2 Tool round loop

After execution:

1. persist `ToolCallItem`
2. persist `ToolResultItem`
3. append OAI assistant tool-call message
4. append OAI tool-result messages
5. open another `/v1/chat/completions` SSE round

Cap with `maxToolRounds` to avoid runaway loops.

### 9.3 Parallel tools

If the request enables `parallel_tool_calls`, allow concurrent execution, but still append results back to history in deterministic tool index order. The provided spec notes `parallel_tool_calls: true` is supported in the API surface, though not universally by all llama.cpp templates.

## 10) MCP support plan

DL already has MCP-app entity fields for rendering web/MCP content:

- `encodingFormat = "text/html;profile=mcp-app"`
- `additionalType = ["WebPage"]`
- tool invocation metadata in `isPartOf[]`
- call-tool input and result payloads in namespaced entity fields.

### 10.1 Recommended internal schema

Use a canonical internal item:

```ts
interface McpRecord {
   kind: 'tool_call' | 'tool_result';
   toolCallId: string;
   toolName: string;
   serverUrl?: string;
   input?: unknown;
   result?: unknown;
   render?: 'mcp-app' | 'plain';
}
```

### 10.2 Wire projection modes

#### Generic DL mode

Project MCP results as a normal `message` with MCP entities.

#### Custom client mode

If `enableCustomMcpActivityWireFormat = true`, also support:

```json
{
  "type": "event",
  "name": "mcp",
  "id": "...",
  "timestamp": "...",
  "from": { "role": "bot", "id": "bot" },
  "replyToId": "...",
  "value": {
    "phase": "call" | "result",
    "toolCallId": "...",
    "toolName": "...",
    "input": {...},
    "result": {...}
  }
}
```

But I would keep this **adapter-private**, because it is outside the DL core types in the provided reference.

## 11) UI mutation tools plan

This is one of the best parts of the design.

### 11.1 Why adapter-owned tools

You want DL features like suggested actions, citations, and hints to be model-driven. The cleanest way is to expose them as normal OAI tools.

### 11.2 Tool definitions

Define three local tools:

#### `ui.set_suggested_actions`

Args:

```json
{
   "actions": [
      {
         "type": "imBack|postBack|messageBack|openUrl",
         "title": "string",
         "value": "string|object",
         "text": "string?",
         "displayText": "string?",
         "image": "string?",
         "imageAltText": "string?"
      }
   ]
}
```

This maps directly to DL `suggestedActions.actions[]`.

#### `ui.set_citations`

Args:

```json
{
   "citations": [
      {
         "name": "string",
         "url": "string?",
         "text": "string?",
         "position": 1
      }
   ]
}
```

Project these into either:

- standalone `Claim` entities
- or the message entity’s `citation[]` array
  because DL supports both patterns.

#### `ui.set_hints`

Args:

```json
{
   "hints": [{ "label": "keyword", "value": "string" }]
}
```

DL has no standard hints field so we convert them into corresponding entity feilds e.g. for keywords:

```json
entities[].keywords = [...]
```

This is an adapter extension.

### 11.3 Execution semantics

These tools should mutate `PendingAssistantTurn`, not emit standalone user-visible tool result messages.

Still, because the model used tools, the adapter must:

- append the assistant tool-call message to OAI history
- append a tool result message like `{"ok": true}`

Then continue generation in the next OAI round.

### 11.4 Final-message application

At finalization:

- apply `suggestedActions`
- attach citations
- attach hints
- optionally enable feedback
- optionally attach author entity
- then emit final `message`

## 12) Final DL message projection

When the assistant is done (`finish_reason = stop|length|content_filter`), emit one final `message`:

```json
{
  "type": "message",
  "id": "...",
  "timestamp": "...",
  "from": { "id": "<botId>", "role": "bot", "name": "<botName>" },
  "replyToId": "<userActivityId>",
  "text": "<final visibleText>",
  "textFormat": "markdown",
  "channelData": {
    "streamType": "final",
    "streamSequence": 999,
    "streamId": "<rootStreamId>",
    "feedbackLoop": { "type": "default", "disclaimer": "..." },
    "adapter": {
      "usage": {...},
      "timings": {...},
      "hints": [...]
    }
  },
  "suggestedActions": { ... },
  "entities": [
    {
      "@context": "https://schema.org",
      "@type": "Message",
      "type": "https://schema.org/Message",
      "keywords": ["AllowCopy", "AIGeneratedContent"],
      "author": { ... },
      "citation": [...]
    },
    ...
  ]
}
```

Why these fields:

- final stream metadata is supported.
- feedback loop is supported via `channelData.feedbackLoop`.
- message keywords and author are supported in `entities[]`.
- citations are supported in `entities[]`.

## 13) Usage and timings policy

If `include_usage` is enabled, OAI may emit a final usage-only chunk with `choices: []`, and it may be missing on interruption.

Plan:

- request `include_usage: true` by default
- store usage only when it arrives
- never block finalization waiting for it
- expose usage in `channelData.adapter.usage`

For llama.cpp `timings`, store them in `channelData.adapter.timings`. The spec explicitly says clients should tolerate vendor extensions like `timings`.

## 14) Error handling plan

### OAI HTTP error before stream starts

Emit final bot `message`:

- concise error text
- `channelData.adapter.error = { stage: "request", status, code }`

### SSE parse error mid-stream

- keep accumulated text
- mark stream interrupted
- emit final `message` with partial content if any
- do not expect usage chunk

### Tool argument JSON invalid

The OAI spec explicitly warns tool arguments may be invalid JSON until assembly.

After terminal assembly:

- if still invalid, create tool result:

   ```json
   { "ok": false, "error": "InvalidArguments" }
   ```

- continue one more round so the model can self-correct

### Tool execution failure

Return structured error tool result:

```json
{
   "ok": false,
   "error": {
      "type": "ToolExecutionError",
      "message": "..."
   }
}
```

### Tool loop runaway

Abort after `maxToolRounds`, finalize with partial answer or a short failure message.

## 15) Implementation phases

### Phase 1 — plain streaming bridge

Ship first:

- DL user `message` → OAI `user`
- OAI SSE `delta.content` → DL `typing`
- final `message`
- usage/timings capture
- no tools yet

### Phase 2 — reasoning paragraphs

Add:

- `delta.reasoning_content`
- paragraph splitter
- informative typing activities with HowTo grouping
- `AnalysisMessage` / `Collapsible`

### Phase 3 — tool assembly loop

Add:

- `delta.tool_calls` assembly
- tool-call terminal handling
- multi-round completion loop
- local tool result injection

### Phase 4 — MCP tools

Add:

- MCP tool registry
- execution bridge
- MCP entity projection
- optional custom `mcp` wire mode

### Phase 5 — UI mutation tools

Add:

- suggested actions tool
- citations tool
- hints tool
- final-message mutation envelope

### Phase 6 — feedback and polish

Add:

- feedback entities / disclaimers
- feedback invoke ingestion
- throttling / coalescing
- richer telemetry

## 16) Test plan

### Unit tests

- DL message → OAI message serialization
- attachment → `image_url` conversion
- reasoning paragraph splitting
- tool-call fragment assembly by tool index
- invalid JSON args handling
- final message projection with citations/actions/hints

### Stream fixture tests

Use recorded SSE fixtures:

1. plain text only
2. reasoning + answer interleaved
3. one tool call
4. parallel tool calls
5. usage final chunk present
6. usage final chunk missing
7. timings present
8. malformed chunk recovery

### End-to-end tests

- `postActivity` with simple user text
- `postActivity` with image attachment
- model sets citations + suggested actions
- model calls MCP tool, returns result, continues answer
- user sends feedback invoke

### Compatibility tests

- with llama.cpp `parse_tool_calls: true`
- with `reasoning_format: deepseek`
- with `thinking_forced_open`
- with vendor extras like `mirostat`
- with `parallel_tool_calls` off and on

## 17) Recommended defaults

I’d start with:

- `stream: true`
- `stream_options.include_usage: true`
- `parse_tool_calls: true`
- `parallel_tool_calls: true`
- `reasoning_format: "deepseek"` only when model/template supports it
- final message keywords:
   - `AllowCopy`
   - `AIGeneratedContent`

- reasoning message keywords:
   - `AnalysisMessage`
   - `Collapsible`

Those align well with the capabilities called out in the two specs.

## 18) The one architectural choice I feel strongest about

The most important decision is this:

**Do not model the whole bridge as a single SSE pass. Model it as a turn orchestrator with potentially multiple OAI SSE rounds.**

Without that, tool calls, MCP, and UI mutation tools will all become awkward or broken. The provided OAI spec already tells you tool calls are streamed, assembled, and end a round with `finish_reason: "tool_calls"`, while llama.cpp may additionally stream separate reasoning content.
