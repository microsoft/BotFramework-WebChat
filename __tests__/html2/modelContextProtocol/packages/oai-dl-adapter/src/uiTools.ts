/**
 * Built-in UI mutation tool descriptors following the MCP ToolDescriptor specification.
 *
 * These tools let the model mutate the DirectLine activity's visible properties
 * (suggested actions, citations, hints) during a completion round, without
 * leaking implementation details to generic DL clients.
 *
 * @see {@link https://spec.modelcontextprotocol.io/specification/server/tools/}
 */
import type { DLCardAction, SchemaOrgEntity, OAITool } from './types.js';

// ─── MCP-compatible annotations ────────────────────────────────────────────

/**
 * Annotations providing hints about tool behavior to LLM planners.
 *
 * @see {@link https://spec.modelcontextprotocol.io/specification/server/tools/}
 */
export interface ToolAnnotations {
  /** Optional display title */
  title?: string;
  /** Indicates the tool is read-only and does not modify state */
  readOnlyHint?: boolean;
  /** Indicates the tool may perform destructive / irreversible actions */
  destructiveHint?: boolean;
  /** Indicates the tool can be called repeatedly without changing the outcome */
  idempotentHint?: boolean;
  /** Indicates the tool may interact with external systems or networks */
  openWorldHint?: boolean;
}

// ─── ToolDescriptor ─────────────────────────────────────────────────────────

/**
 * Tool descriptor for the adapter's internal tool registry.
 *
 * Mirrors the MCP ToolDescriptor shape: a named function with a JSON Schema
 * for its input and an `execute` handler invoked locally.
 *
 * @template TArgs - Shape of the parsed arguments object passed to `execute`.
 */
export interface ToolDescriptor<TArgs = unknown> {
  /** Unique tool identifier (used as `function.name` in OAI wire format). */
  name: string;
  /** Human-readable summary of what the tool does. */
  description: string;
  /** JSON Schema describing accepted input arguments. */
  inputSchema?: object;
  /** JSON Schema describing structured output (optional). */
  outputSchema?: object;
  /** Optional behavior hints for LLM planners. */
  annotations?: ToolAnnotations;
  /** Local execution function called when the model invokes this tool. */
  execute: (args: TArgs) => unknown | Promise<unknown>;
  _meta?: any;
}

// ─── OAI conversion ─────────────────────────────────────────────────────────

/**
 * Convert a ToolDescriptor to an OpenAI-compatible function tool definition
 * suitable for inclusion in the `tools` array of a `/v1/chat/completions` request.
 */
export function toOAITool(descriptor: ToolDescriptor): OAITool {
  return {
    type: 'function',
    function: {
      name: descriptor.name,
      description: descriptor.description,
      ...(descriptor.inputSchema ? { parameters: descriptor.inputSchema } : {})
    }
  };
}

// ─── Built-in UI mutation tools ─────────────────────────────────────────────

/**
 * `ui.set_suggested_actions` — Display follow-up suggestion buttons below
 * the ongoing message.
 *
 * The model calls this tool to attach `suggestedActions` to the final DL
 * activity.  The adapter intercepts the result and applies a UI mutation
 * rather than rendering a generic tool card.
 */
export const UI_TOOL_SET_SUGGESTED_ACTIONS: ToolDescriptor<{ actions: DLCardAction[] }> = {
  name: 'ui.set_suggested_actions',
  description: 'Display follow-up suggestion buttons below the ongoing message. Does not reflect user choice.',
  annotations: { readOnlyHint: false, idempotentHint: true },
  inputSchema: {
    type: 'object',
    properties: {
      actions: {
        type: 'array',
        description: 'List of suggested action buttons.',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['imBack', 'postBack'],
              description: 'Action type. Use "imBack" to echo the value in chat.'
            },
            title: {
              type: 'string',
              description: 'Button label shown to the user.'
            },
            value: {
              type: 'string',
              description: 'Text sent to the bot when the button is clicked.'
            }
          },
          required: ['type', 'title', 'value']
        }
      }
    },
    required: ['actions']
  },
  execute: () => ({ ok: true })
};

/**
 * `ui.set_citations` — Attach citation references (schema.org Claim objects)
 * to the ongoing message.
 *
 * The model calls this tool to supply citations that will appear as DL
 * citation entities on the final `message` activity.
 */
export const UI_TOOL_SET_CITATIONS: ToolDescriptor<{ citations: SchemaOrgEntity[] }> = {
  name: 'ui.set_citations',
  description: 'Attach citation references (schema.org Claim objects) to the ongoing message.',
  annotations: { readOnlyHint: false, idempotentHint: true },
  inputSchema: {
    type: 'object',
    properties: {
      citations: {
        type: 'array',
        description: 'List of citation Claim objects.',
        items: {
          type: 'object',
          properties: {
            '@type': { type: 'string', enum: ['Claim'] },
            '@id': { type: 'string', description: 'Citation identifier, e.g. "cite:1".' },
            name: { type: 'string', description: 'Citation title / document name.' },
            text: { type: 'string', description: 'Short excerpt or summary.' },
            position: { type: 'number', description: 'Display position (1-based).' }
          },
          required: ['@type', '@id', 'name', 'text', 'position']
        }
      }
    },
    required: ['citations']
  },
  execute: () => ({ ok: true })
};

/**
 * `ui.set_hints` — Set hint text displayed below the input box.
 *
 * The model calls this tool to suggest short prompts or hints that guide the
 * user's next input.
 */
export const UI_TOOL_SET_HINTS: ToolDescriptor<{ hints: string[] }> = {
  name: 'ui.set_hints',
  description: 'Set hint text displayed below the input box.',
  annotations: { readOnlyHint: false, idempotentHint: true },
  inputSchema: {
    type: 'object',
    properties: {
      hints: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of hint strings shown below the chat input.'
      }
    },
    required: ['hints']
  },
  execute: () => ({ ok: true })
};

/** All built-in UI mutation tools, in registration order. */
export const BUILTIN_UI_TOOLS: ToolDescriptor[] = [
  UI_TOOL_SET_SUGGESTED_ACTIONS as ToolDescriptor,
  UI_TOOL_SET_CITATIONS as ToolDescriptor,
  UI_TOOL_SET_HINTS as ToolDescriptor
];
