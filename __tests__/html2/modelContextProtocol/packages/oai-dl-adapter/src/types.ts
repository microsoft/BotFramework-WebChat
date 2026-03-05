/* eslint-disable no-magic-numbers */
// ─── DirectLine Activity ────────────────────────────────────────────────────

export interface DLActivity {
  type: 'message' | 'typing' | 'invoke' | string;
  id?: string;
  timestamp?: string;
  text?: string;
  textFormat?: 'markdown' | 'plain';
  locale?: string;
  from?: { id: string; role?: 'user' | 'bot' | 'channel'; name?: string };
  replyToId?: string;
  conversation?: { id: string };
  channelId?: string;
  channelData?: Record<string, unknown>;
  attachments?: DLAttachment[];
  suggestedActions?: DLSuggestedActions;
  entities?: SchemaOrgEntity[];
  name?: string;
  value?: unknown;
}

export interface DLAttachment {
  contentType: string;
  content?: unknown;
  contentUrl?: string;
  name?: string;
}

export interface DLSuggestedActions {
  to?: string[];
  actions: DLCardAction[];
}

export interface DLCardAction {
  type: 'imBack' | 'postBack' | 'messageBack' | 'openUrl';
  title: string;
  value?: string | object;
  text?: string;
  displayText?: string;
  image?: string;
  imageAltText?: string;
}

export interface SchemaOrgEntity {
  '@context'?: string;
  '@type'?: string;
  '@id'?: string;
  type?: string;
  [key: string]: unknown;
}

// ─── Connection Status (mirrors botframework-directlinejs) ──────────────────

export enum ConnectionStatus {
  Uninitialized = 0,
  Connecting = 1,
  Online = 2,
  ExpiredToken = 3,
  FailedToConnect = 4,
  Ended = 5
}

// ─── Adapter Configuration ──────────────────────────────────────────────────

export interface AdapterConfig {
  /** Base URL for the OAI-compatible endpoint (e.g. http://localhost:8080) */
  baseUrl: string;
  /** Model identifier */
  model: string;
  /** Optional Bearer token */
  apiKey?: string;
  /** Optional system prompt */
  systemPrompt?: string;
  /** Optional developer prompt (for newer reasoning models) */
  developerPrompt?: string;
  /** Tools available to the model (MCP + UI-mutation) */
  tools?: OAITool[];
  /** Maximum number of tool-call rounds before halting */
  maxToolRounds?: number;
  /** Whether to request usage stats in the stream */
  includeUsage?: boolean;
  /** Extra llama.cpp-specific request fields merged into every request */
  defaultRequest?: Record<string, unknown>;
  /** Bot identity for outgoing activities */
  botId?: string;
  botName?: string;
  /** Conversation id (auto-generated if omitted) */
  conversationId?: string;
}

// ─── OAI Wire Types ─────────────────────────────────────────────────────────

export type OAIRole = 'developer' | 'system' | 'user' | 'assistant' | 'tool';

export interface OAITextContentPart {
  type: 'text';
  text: string;
}

export interface OAIImageContentPart {
  type: 'image_url';
  image_url: { url: string };
}

export type OAIContentPart = OAITextContentPart | OAIImageContentPart;

export interface OAIMessage {
  role: OAIRole;
  content: string | OAIContentPart[] | null;
  tool_calls?: OAIToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface OAITool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: object;
    strict?: boolean;
  };
}

export interface OAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// ─── OAI SSE Chunk Types ────────────────────────────────────────────────────

export interface OAIChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model?: string;
  choices: OAIChunkChoice[];
  usage?: OAIUsage | null;
  timings?: LlamaTimings;
}

export interface OAIChunkChoice {
  index: number;
  delta: OAIDelta;
  finish_reason: string | null;
}

export interface OAIDelta {
  role?: OAIRole;
  content?: string | null;
  reasoning_content?: string | null;
  tool_calls?: OAIToolCallFragment[];
  refusal?: string | null;
}

export interface OAIToolCallFragment {
  index: number;
  id?: string;
  type?: 'function';
  function?: {
    name?: string;
    arguments?: string;
  };
}

export interface OAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface LlamaTimings {
  cache_n?: number;
  prompt_n?: number;
  prompt_ms?: number;
  prompt_per_token_ms?: number;
  prompt_per_second?: number;
  predicted_n?: number;
  predicted_ms?: number;
  predicted_per_token_ms?: number;
  predicted_per_second?: number;
}

// ─── Internal Transcript Model ───────────────────────────────────────────────

export type TranscriptItem =
  | UserMessageItem
  | AssistantMessageItem
  | ReasoningStepItem
  | ToolCallItem
  | ToolResultItem
  | UiMutationItem
  | ErrorItem;

export interface BaseItem {
  id: string;
  createdAt: string;
  conversationId: string;
  source: 'client' | 'adapter' | 'model' | 'tool';
}

export interface UserMessageItem extends BaseItem {
  kind: 'user_message';
  text: string;
  attachments?: DLAttachment[];
  locale?: string;
  /** Original DL activity id */
  activityId?: string;
}

export interface AssistantMessageItem extends BaseItem {
  kind: 'assistant_message';
  text: string;
  /** OAI tool calls that were triggered during this assistant turn */
  toolCalls?: OAIToolCall[];
  usage?: OAIUsage;
  timings?: LlamaTimings;
  /** Suggestion actions emitted by UI mutation tools */
  suggestedActions?: DLCardAction[];
  citations?: SchemaOrgEntity[];
}

export interface ReasoningStepItem extends BaseItem {
  kind: 'reasoning_step';
  text: string;
  position: number;
  /** Unique group id for this reasoning sequence (same per assistant turn) */
  howToId: string;
  status: 'Incomplete' | 'Published';
}

export interface ToolCallItem extends BaseItem {
  kind: 'tool_call';
  toolCallId: string;
  toolName: string;
  arguments: unknown;
  vendor?: 'openai' | 'llama.cpp';
}

export interface ToolResultItem extends BaseItem {
  kind: 'tool_result';
  toolCallId: string;
  toolName: string;
  result: unknown;
  isError?: boolean;
  renderAsMcp?: boolean;
}

export interface UiMutationItem extends BaseItem {
  kind: 'ui_mutation';
  mutation: UiMutation;
}

export type UiMutation =
  | { type: 'set_suggested_actions'; actions: DLCardAction[] }
  | { type: 'set_citations'; citations: SchemaOrgEntity[] }
  | { type: 'set_hints'; hints: string[] }
  | { type: 'set_message_entity_fields'; entity: any };

export interface ErrorItem extends BaseItem {
  kind: 'error';
  message: string;
  code?: string;
}

// ─── Streaming state ─────────────────────────────────────────────────────────

export interface PendingAssistantTurn {
  rootStreamId: string;
  /** Accumulated visible answer text */
  visibleText: string;
  /** Accumulated reasoning text (llama.cpp) */
  reasoningText: string;
  /** Sealed reasoning paragraphs */
  reasoningSteps: ReasoningStep[];
  /** Tool call assembly map: choiceIndex → toolIndex → assembly */
  toolCallAssembly: Map<number, Map<number, ToolCallAssembly>>;
  /** Round finish reason */
  finishReason: string | null;
  /** Usage (from final usage chunk) */
  usage?: OAIUsage;
  /** llama.cpp timings */
  timings?: LlamaTimings;
  /** Accumulated DL stream sequence counter */
  streamSequence: number;
  /** UI mutations collected from tool results */
  suggestedActions: DLCardAction[];
  citations: SchemaOrgEntity[];
  /**
   * ISO timestamp of the last reasoning step activity emitted during this turn.
   * Used by the caller to compute a strictly-later timestamp for the final
   * message activity so WebChat orders it after all reasoning paragraphs.
   */
  lastReasoningActivityTimestamp?: string;
}

export interface ReasoningStep {
  text: string;
  position: number;
  status: 'Incomplete' | 'Published';
}

export interface ToolCallAssembly {
  id?: string;
  type?: string;
  name?: string;
  argumentsText: string;
}
