/* eslint-disable class-methods-use-this */
import type {
  TranscriptItem,
  UserMessageItem,
  AssistantMessageItem,
  ReasoningStepItem,
  ToolCallItem,
  ToolResultItem,
  ErrorItem,
  DLCardAction,
  SchemaOrgEntity
} from './types.ts';

/**
 * ConversationStore - append-only log of all transcript items for a single conversation.
 *
 * Transient typing/streaming revisions are NOT stored here;
 * only finalized items that should contribute to the model history.
 */
export class ConversationStore {
  private readonly items: TranscriptItem[] = [];
  private idCounter = 0;
  conversationId: string;

  constructor(conversationId: string) {
    this.conversationId = conversationId;
  }

  private nextId(prefix: string): string {
    return `${prefix}-${++this.idCounter}-${Date.now()}`;
  }

  private now(): string {
    return new Date().toISOString();
  }

  addUserMessage(params: Pick<UserMessageItem, 'text' | 'attachments' | 'locale' | 'activityId'>): UserMessageItem {
    const item: UserMessageItem = {
      kind: 'user_message',
      id: this.nextId('um'),
      createdAt: this.now(),
      conversationId: this.conversationId,
      source: 'client',
      ...params
    };
    this.items.push(item);
    return item;
  }

  addAssistantMessage(
    params: Pick<AssistantMessageItem, 'text' | 'toolCalls' | 'usage' | 'timings' | 'suggestedActions' | 'citations'>
  ): AssistantMessageItem {
    const item: AssistantMessageItem = {
      kind: 'assistant_message',
      id: this.nextId('am'),
      createdAt: this.now(),
      conversationId: this.conversationId,
      source: 'model',
      ...params
    };
    this.items.push(item);
    return item;
  }

  addReasoningStep(params: Pick<ReasoningStepItem, 'text' | 'position' | 'howToId' | 'status'>): ReasoningStepItem {
    const item: ReasoningStepItem = {
      kind: 'reasoning_step',
      id: this.nextId('rs'),
      createdAt: this.now(),
      conversationId: this.conversationId,
      source: 'model',
      ...params
    };
    this.items.push(item);
    return item;
  }

  addToolCall(params: Pick<ToolCallItem, 'toolCallId' | 'toolName' | 'arguments' | 'vendor'>): ToolCallItem {
    const item: ToolCallItem = {
      kind: 'tool_call',
      id: this.nextId('tc'),
      createdAt: this.now(),
      conversationId: this.conversationId,
      source: 'adapter',
      ...params
    };
    this.items.push(item);
    return item;
  }

  addToolResult(
    params: Pick<ToolResultItem, 'toolCallId' | 'toolName' | 'result' | 'isError' | 'renderAsMcp'>
  ): ToolResultItem {
    const item: ToolResultItem = {
      kind: 'tool_result',
      id: this.nextId('tr'),
      createdAt: this.now(),
      conversationId: this.conversationId,
      source: 'tool',
      ...params
    };
    this.items.push(item);
    return item;
  }

  addError(params: Pick<ErrorItem, 'message' | 'code'>): ErrorItem {
    const item: ErrorItem = {
      kind: 'error',
      id: this.nextId('err'),
      createdAt: this.now(),
      conversationId: this.conversationId,
      source: 'adapter',
      ...params
    };
    this.items.push(item);
    return item;
  }

  /** Returns all items for model history serialization */
  getItems(): readonly TranscriptItem[] {
    return this.items;
  }

  /** Collects accumulated suggested actions from ui_mutation items */
  getLatestSuggestedActions(): DLCardAction[] {
    let result: DLCardAction[] = [];
    for (const item of this.items) {
      if (item.kind === 'ui_mutation' && item.mutation.type === 'set_suggested_actions') {
        result = item.mutation.actions;
      }
    }
    return result;
  }

  /** Collects latest citations from ui_mutation items */
  getLatestCitations(): SchemaOrgEntity[] {
    let result: SchemaOrgEntity[] = [];
    for (const item of this.items) {
      if (item.kind === 'ui_mutation' && item.mutation.type === 'set_citations') {
        result = item.mutation.citations;
      }
    }
    return result;
  }
}
