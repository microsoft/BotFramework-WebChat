/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable class-methods-use-this */
import type { TranscriptItem, OAIMessage, OAIContentPart, DLAttachment, AdapterConfig } from './types.ts';

/**
 * TranscriptSerializer - converts internal TranscriptItems into OAI messages[].
 *
 * Rules (per spec §5):
 * 1. developer message (if configured)
 * 2. system message (if configured)
 * 3. transcript items chronologically
 * 4. current user activity as final user message (caller appends)
 *
 * Transient typing revisions are NOT in the transcript store so they
 * are never serialized.
 */
export class TranscriptSerializer {
  private readonly config: AdapterConfig;
  constructor(config: AdapterConfig) {
    this.config = config;
  }

  /** Build the messages[] prefix (developer + system) */
  buildSystemMessages(): OAIMessage[] {
    const msgs: OAIMessage[] = [];
    if (this.config.developerPrompt) {
      msgs.push({ role: 'developer', content: this.config.developerPrompt });
    }
    if (this.config.systemPrompt) {
      msgs.push({ role: 'system', content: this.config.systemPrompt });
    }
    return msgs;
  }

  /** Serialize a slice of transcript items to OAI messages */
  serializeItems(items: readonly TranscriptItem[]): OAIMessage[] {
    const msgs: OAIMessage[] = [];

    for (const item of items) {
      switch (item.kind) {
        case 'user_message': {
          const parts = buildUserContentParts(item.text, item.attachments);
          msgs.push({
            role: 'user',
            content:
              parts.length === 1 && parts[0].type === 'text' ? (parts[0] as { type: 'text'; text: string }).text : parts
          });
          break;
        }

        case 'assistant_message': {
          if (item.toolCalls && item.toolCalls.length > 0) {
            // Assistant turn that triggered tool calls
            msgs.push({
              role: 'assistant',
              content: item.text || null,
              tool_calls: item.toolCalls
            });
          } else {
            msgs.push({ role: 'assistant', content: item.text });
          }
          break;
        }

        case 'tool_result': {
          msgs.push({
            role: 'tool',
            tool_call_id: item.toolCallId,
            content: serializeToolResult(item.result)
          });
          break;
        }

        case 'reasoning_step':
        case 'ui_mutation':
        case 'error':
          // Not sent to model
          break;

        default:
          break;
      }
    }

    return msgs;
  }

  /** Full messages array for a new completion round */
  buildMessages(items: readonly TranscriptItem[]): OAIMessage[] {
    return [...this.buildSystemMessages(), ...this.serializeItems(items)];
  }
}

function buildUserContentParts(text: string, attachments?: DLAttachment[]): OAIContentPart[] {
  const parts: OAIContentPart[] = [];

  if (text) {
    parts.push({ type: 'text', text });
  }

  if (attachments) {
    for (const att of attachments) {
      if (att.contentType.startsWith('image/')) {
        const url = att.contentUrl ?? (typeof att.content === 'string' ? att.content : undefined);
        if (url) {
          parts.push({ type: 'image_url', image_url: { url } });
        }
      }
      // Non-image attachments: omit from model input; kept in transcript metadata only
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', text: '' }];
}

function serializeToolResult(result: unknown): string {
  if (typeof result === 'string') {
    return result;
  }
  try {
    return JSON.stringify(result);
  } catch {
    return String(result);
  }
}
