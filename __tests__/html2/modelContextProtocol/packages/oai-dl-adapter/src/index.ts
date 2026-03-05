/**
 * @msinternal/oai-dl-adapter
 *
 * OpenAI-compatible Chat Completions → DirectLine adapter for Web Chat.
 *
 * Usage:
 *   import { create } from '@msinternal/oai-dl-adapter';
 *
 *   const directLine = create({
 *     baseUrl: 'http://localhost:8080',
 *     model: 'Qwen3.5-35B-A3B-UD-IQ3_XXS.gguf',
 *     systemPrompt: 'You are a helpful assistant.',
 *     // Optional llama.cpp extensions:
 *     defaultRequest: {
 *       reasoning_format: 'deepseek',
 *       chat_template_kwargs: { enable_thinking: true }
 *     }
 *   });
 *
 *   // Pass to WebChat
 *   window.WebChat.renderWebChat({ directLine }, document.getElementById('webchat'));
 */

export { create } from './create.js';
export type { IBotConnection } from './create.js';
export type { AdapterConfig, OAITool, DLActivity, DLCardAction, SchemaOrgEntity } from './types.js';
export { ConnectionStatus } from './types.js';
export { ToolOrchestrator } from './toolOrchestrator.js';
export type { ToolDescriptor, ToolAnnotations } from './toolOrchestrator.js';
export {
  toOAITool,
  BUILTIN_UI_TOOLS,
  UI_TOOL_SET_SUGGESTED_ACTIONS,
  UI_TOOL_SET_CITATIONS,
  UI_TOOL_SET_HINTS
} from './uiTools.js';
