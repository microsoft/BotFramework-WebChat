/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable default-case */
import type { DLCardAction, SchemaOrgEntity, UiMutation, OAITool } from './types.js';
import {
  BUILTIN_UI_TOOLS,
  UI_TOOL_SET_SUGGESTED_ACTIONS,
  UI_TOOL_SET_CITATIONS,
  UI_TOOL_SET_HINTS,
  toOAITool
} from './uiTools.js';

export type { ToolDescriptor, ToolAnnotations } from './uiTools.js';
import type { ToolDescriptor } from './uiTools.js';

export interface ToolOrchestrationResult {
  result: unknown;
  isError: boolean;
  /** Present if a UI mutation was encoded in this tool result */
  uiMutation?: UiMutation;
  renderAsMcp?: boolean;
}

/**
 * ToolOrchestrator - manages ToolDescriptor registrations, dispatches tool
 * calls to their `execute` handlers, detects UI-mutation tools, and can
 * project all registered tools to OAI wire format for the model request.
 */
export class ToolOrchestrator {
  readonly registry: Map<string, ToolDescriptor> = new Map();

  /**
   * @param extraDescriptors - Additional tool descriptors to register on
   *   top of the built-in UI mutation tools.  Descriptors with the same
   *   name as a built-in will replace the built-in.
   */
  constructor(extraDescriptors: ToolDescriptor[] = []) {
    // Register built-in UI mutation tools first
    for (const d of BUILTIN_UI_TOOLS) {
      this.registry.set(d.name, d);
    }
    // Extra descriptors override built-ins when names collide
    for (const d of extraDescriptors) {
      this.registry.set(d.name, d);
    }
  }

  /** Register (or replace) a single tool descriptor. */
  registerDescriptor(descriptor: ToolDescriptor): void {
    this.registry.set(descriptor.name, descriptor);
  }

  /**
   * Return all registered descriptors projected to OAI wire tool format.
   * Suitable for inclusion in the `tools` array of a `/v1/chat/completions`
   * request body.
   */
  getOAITools(): OAITool[] {
    return [...this.registry.values()].map(toOAITool);
  }

  async execute(toolName: string, args: unknown): Promise<ToolOrchestrationResult> {
    const descriptor = this.registry.get(toolName);
    if (!descriptor) {
      return {
        result: { error: `No handler registered for tool: ${toolName}` },
        isError: true
      };
    }

    try {
      const raw = await descriptor.execute(args as never);
      // Detect and extract any UI mutation carried by this tool call
      const uiMutation = tryExtractUiMutation(toolName, args, raw, this);
      return {
        result: raw ?? { ok: true },
        isError: false,
        ...(uiMutation ? { uiMutation } : {})
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { result: { error: message }, isError: true };
    }
  }

  /** Run all tool calls in parallel (if the model issued multiple). */
  async executeAll(
    calls: Array<{ id: string; name: string; arguments: unknown }>
  ): Promise<Array<ToolOrchestrationResult & { id: string; name: string }>> {
    return Promise.all(
      calls.map(async call => {
        const res = await this.execute(call.name, call.arguments);
        return { ...res, id: call.id, name: call.name };
      })
    );
  }
}

function tryExtractUiMutation(toolName: string, args: unknown, result: unknown, orchestrator: ToolOrchestrator): UiMutation | null {
  if (!args || typeof args !== 'object') {
    return null;
  }
  const a = args as Record<string, unknown>;

  const tool = orchestrator.registry.get(toolName);

  if (tool?._meta?.ui) {
    return {
      type: 'set_message_entity_fields',
      entity: {
        additionalType: ['WebPage'],
        encodingFormat: 'text/html;profile=mcp-app',
        isPartOf: [
          {
            '@type': ['HowToTool', 'urn:microsoft:webchat:model-context-protocol:call-tool'],
            name: 'show-weather',
            url: 'https://mcp-apps-020426-ctgxdudsfxgebfa8.canadacentral-01.azurewebsites.net/mcp'
          }
        ],
        'urn:microsoft:webchat:model-context-protocol:call-tool:input': args,
        'urn:microsoft:webchat:model-context-protocol:call-tool:result': result
      }
    };
  }

  switch (toolName) {
    case UI_TOOL_SET_SUGGESTED_ACTIONS.name: {
      const { actions } = a;
      if (Array.isArray(actions)) {
        return { type: 'set_suggested_actions', actions: actions as DLCardAction[] };
      }
      break;
    }
    case UI_TOOL_SET_CITATIONS.name: {
      const { citations } = a;
      if (Array.isArray(citations)) {
        return { type: 'set_citations', citations: citations as SchemaOrgEntity[] };
      }
      break;
    }
    case UI_TOOL_SET_HINTS.name: {
      const { hints } = a;
      if (Array.isArray(hints)) {
        return { type: 'set_hints', hints: hints as string[] };
      }
      break;
    }
  }

  return null;
}
