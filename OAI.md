# OpenAI-Compatible Chat Completions Spec

## Endpoint: `POST /v1/chat/completions`

Version date: 2026-02-26

## 1. Scope

This document specifies an OpenAI-compatible `POST /v1/chat/completions` endpoint, with explicit notes for llama.cpp extensions.

The baseline contract follows OpenAI Chat Completions. New OpenAI projects are generally encouraged to use the Responses API, but `/v1/chat/completions` remains a valid and widely used compatibility target.

This spec focuses on:

- request and response shape
- streaming over Server-Sent Events (SSE)
- tool-call streaming
- llama.cpp request and response extensions

## 2. Compatibility model

An implementation is considered compatible if it:

1. Accepts standard Chat Completions requests with `model` and `messages`.
2. Returns either:
   - one JSON object with `object: "chat.completion"`, or
   - an SSE stream of JSON objects with `object: "chat.completion.chunk"`.
3. Uses `choices[].delta` for streamed partial output.
4. Terminates a stream with `data: [DONE]`.
5. Preserves unknown fields without breaking clients.

llama.cpp-specific fields are extensions. Clients should treat them as optional.

## 3. HTTP contract

### Request

- **Method:** `POST`
- **Path:** `/v1/chat/completions`
- **Content-Type:** `application/json`
- **Authorization:** OpenAI-style Bearer auth may be accepted by compatible servers, even if the backend does not validate a real OpenAI key.

### Response

- **Non-streaming:** `application/json`
- **Streaming:** `text/event-stream`

## 4. Request body

### 4.1 Required fields

#### `model: string`

Model identifier.

#### `messages: array`

Conversation history.

Supported OpenAI message roles include:

- `developer`
- `system`
- `user`
- `assistant`
- `tool`

For newer OpenAI reasoning models, `developer` is the preferred instruction role.

### 4.2 Message content

At minimum, implementations should support plain text messages:

```json
{ "role": "user", "content": "Hello" }
```

OpenAI-compatible multimodal servers may also support typed content parts in `content`, for example:

- `{"type":"text","text":"Describe this image"}`
- `{"type":"image_url","image_url":{"url":"https://example.com/cat.png"}}`

llama.cpp documents `image_url` support for multimodal models and accepts both remote URLs and base64 image data.

### 4.3 Common optional fields

Common OpenAI fields that a compatible implementation should accept when possible:

- `stream: boolean`
- `stream_options.include_usage: boolean`
- `max_completion_tokens: number`
- `temperature: number`
- `top_p: number`
- `stop: string | string[]`
- `response_format: object`
- `tools: array`
- `tool_choice: string | object`
- `parallel_tool_calls: boolean`
- `logprobs: boolean`

Notes:

- `max_tokens` is legacy/deprecated in OpenAI and should be treated as compatibility input where practical.
- `stop` is not supported by all modern OpenAI reasoning models; compatibility servers may still implement it.

## 5. Minimal request example

```json
{
   "model": "gpt-4.1",
   "messages": [{ "role": "user", "content": "Write a haiku about servers." }]
}
```

## 6. Non-streaming response

A normal successful response is one JSON object:

```json
{
   "id": "chatcmpl_123",
   "object": "chat.completion",
   "created": 1772131040,
   "model": "gpt-4.1",
   "choices": [
      {
         "index": 0,
         "message": {
            "role": "assistant",
            "content": "Soft fans hum at dusk."
         },
         "finish_reason": "stop"
      }
   ],
   "usage": {
      "prompt_tokens": 12,
      "completion_tokens": 7,
      "total_tokens": 19
   }
}
```

### 6.1 Choice semantics

Each entry in `choices` contains:

- `index`
- `message`
- `finish_reason`

Common `finish_reason` values:

- `stop`
- `length`
- `tool_calls`
- `content_filter`
- `function_call` (deprecated compatibility value)

## 7. Streaming over SSE

When `stream: true`, the server must return data-only SSE events.

Each event line uses this form:

```text
data: {JSON}
```

The stream ends with:

```text
data: [DONE]
```

No client should assume one token per event. A chunk may contain:

- a role prelude
- one or more text fragments
- one or more tool-call fragments
- vendor-specific extension fields

## 8. Streamed chunk schema

Each streamed JSON event is a chunk with:

- `id: string`
- `object: "chat.completion.chunk"`
- `created: number`
- `model: string`
- `choices: array`

Each `choices[i]` contains:

- `index: number`
- `delta: object`
- `finish_reason: string | null`

`delta` may contain:

- `role`
- `content`
- `refusal`
- `tool_calls`
- deprecated `function_call`

If `stream_options.include_usage` is enabled, chunks may also contain:

- `usage: null` on ordinary chunks
- `usage: { ... }` on a final extra chunk with `choices: []`

## 9. Standard chunk flow

### 9.1 Role prelude

The first chunk often sets the assistant role:

```text
data: {"id":"chatcmpl_123","object":"chat.completion.chunk","created":1772131039,"model":"gpt-4.1","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}
```

### 9.2 Content chunks

Subsequent chunks append content:

```text
data: {"id":"chatcmpl_123","object":"chat.completion.chunk","created":1772131040,"model":"gpt-4.1","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}
data: {"id":"chatcmpl_123","object":"chat.completion.chunk","created":1772131040,"model":"gpt-4.1","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}
```

### 9.3 Terminal chunk

The terminal chunk usually carries an empty delta and a non-null finish reason:

```text
data: {"id":"chatcmpl_123","object":"chat.completion.chunk","created":1772131040,"model":"gpt-4.1","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}
data: [DONE]
```

## 10. Usage chunk semantics

If the request includes:

```json
{
   "stream": true,
   "stream_options": { "include_usage": true }
}
```

the server should emit one additional chunk before `[DONE]`:

```text
data: {"id":"chatcmpl_123","object":"chat.completion.chunk","created":1772131040,"model":"gpt-4.1","choices":[],"usage":{"prompt_tokens":12,"completion_tokens":7,"total_tokens":19}}
data: [DONE]
```

Rules:

- the final usage chunk has `choices: []`
- earlier chunks may include `usage: null`
- if the connection is interrupted, the final usage chunk may be missing

## 11. Tool-call streaming

When a tool is selected, chunks may stream `delta.tool_calls`.

### 11.1 Example

```text
data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_1","type":"function","function":{"name":"get_weather","arguments":""}}]},"finish_reason":null}]}
data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\"location\":\"Boston\"}"}}]},"finish_reason":null}]}
data: {"choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}
data: [DONE]
```

### 11.2 Client assembly rules

Clients should concatenate tool-call fragments by:

- choice index
- tool call index

`function.arguments` must be treated as streamed text and parsed only after assembly. It may be invalid JSON and must be validated before execution.

## 12. llama.cpp extensions

The following are documented llama.cpp additions on top of the OpenAI-compatible shape.

### 12.1 Request extensions

#### `chat_template_kwargs: object`

Extra parameters passed into the Jinja/chat templating system.

Example:

```json
{
   "chat_template_kwargs": {
      "enable_thinking": false
   }
}
```

#### `reasoning_format: string`

Controls reasoning parsing. If set to `none`, llama.cpp returns raw generated text instead of parsing reasoning into a dedicated field.

#### `thinking_forced_open: boolean`

For supported reasoning models, forces reasoning output to stay visible/open.

#### `parse_tool_calls: boolean`

Requests parsing of generated tool calls.

#### llama.cpp completion sampling fields

llama.cpp notes that `/completion`-specific generation controls are also accepted, such as `mirostat`. Treat these as vendor-specific request extensions.

### 12.2 Response extensions

#### `delta.reasoning_content: string`

In streaming mode, llama.cpp may emit reasoning separately from visible answer text.

Example:

```text
data: {"choices":[{"index":0,"delta":{"reasoning_content":"Let me think"}}],"object":"chat.completion.chunk"}
data: {"choices":[{"index":0,"delta":{"content":"Hello!"}}],"object":"chat.completion.chunk"}
```

Client rule:

- accumulate `delta.reasoning_content` separately from `delta.content`
- do not assume both appear in the same chunk
- treat `reasoning_content` as optional and vendor-specific

#### `timings: object`

llama.cpp may attach server performance data to responses and chunks.

Typical fields include:

- `cache_n`
- `prompt_n`
- `prompt_ms`
- `prompt_per_token_ms`
- `prompt_per_second`
- `predicted_n`
- `predicted_ms`
- `predicted_per_token_ms`
- `predicted_per_second`

The llama.cpp docs state that current context usage can be estimated as:

```text
prompt_n + cache_n + predicted_n
```

### 12.3 Structured output extension behavior

llama.cpp documents support for:

- `{"type":"json_object"}`
- `{"type":"json_object","schema":{...}}`
- `{"type":"json_schema","schema":{...}}`

Note that OpenAI's current structured-output contract uses `json_schema` under `response_format` for the schema-bearing variant. The llama.cpp `schema` property should therefore be treated as a compatibility extension rather than a strict OpenAI field match.

### 12.4 Function-calling and templates

llama.cpp supports OpenAI-style function calling when the server is started with `--jinja`. Tool behavior depends on the active chat template:

- native tool-call templates are available for some model families
- a generic fallback exists when no native format handler is recognized
- `parallel_tool_calls: true` is supported on some models but is not universally available

## 13. Recommended parser behavior

Clients consuming this endpoint should:

1. ignore unknown top-level fields
2. accumulate `delta.content` into visible assistant text
3. accumulate `delta.reasoning_content` separately if present
4. accumulate streamed tool-call arguments by tool index
5. stop on the first chunk whose `finish_reason` is non-null, but still read until `[DONE]`
6. not rely on a final usage chunk unless `include_usage` was requested
7. tolerate vendor extensions such as `timings`

## 14. Minimal streaming request example

```json
{
   "model": "gpt-4.1",
   "stream": true,
   "messages": [{ "role": "user", "content": "Hello" }]
}
```

## 15. llama.cpp streaming request example

```json
{
   "model": "Qwen3.5-35B-A3B-UD-IQ3_XXS.gguf",
   "stream": true,
   "messages": [{ "role": "user", "content": "Say hello" }],
   "reasoning_format": "deepseek",
   "parse_tool_calls": true,
   "parallel_tool_calls": true,
   "chat_template_kwargs": {
      "enable_thinking": true
   }
}
```

## 16. Summary

The safest interoperability target is:

- match OpenAI request and response field names for core chat completions
- stream data as SSE `chat.completion.chunk` events
- use `choices[].delta` patches
- terminate with `data: [DONE]`
- treat llama.cpp additions such as `reasoning_content`, `timings`, `chat_template_kwargs`, and `mirostat`-style controls as optional extensions

## References

1. OpenAI API Reference - Create chat completion. Accessed 2026-02-26.  
   https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create/

2. OpenAI API Reference - Chat Completions streaming events. Accessed 2026-02-26.  
   https://developers.openai.com/api/reference/resources/chat/subresources/completions/streaming-events

3. OpenAI API Guide - Streaming API responses. Accessed 2026-02-26.  
   https://developers.openai.com/api/docs/guides/streaming-responses/

4. ggml-org/llama.cpp - tools/server/README.md (master branch). Accessed 2026-02-26.  
   https://raw.githubusercontent.com/ggml-org/llama.cpp/master/tools/server/README.md

5. ggml-org/llama.cpp - docs/function-calling.md (master branch). Accessed 2026-02-26.  
   https://raw.githubusercontent.com/ggml-org/llama.cpp/master/docs/function-calling.md
