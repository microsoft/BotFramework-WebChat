/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable default-case */
/* eslint-disable eqeqeq */
/* eslint-disable no-eq-null */
/* eslint-disable no-magic-numbers */
import type { OAIChunk, OAIToolCallFragment, PendingAssistantTurn, LlamaTimings, OAIUsage } from './types.ts';

export type ChunkEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'reasoning_delta'; text: string }
  | { type: 'tool_call_delta'; choiceIndex: number; toolIndex: number; fragment: OAIToolCallFragment }
  | { type: 'finish'; finishReason: string }
  | { type: 'usage'; usage: OAIUsage }
  | { type: 'timings'; timings: LlamaTimings };

/**
 * Parse a single SSE data line into a ChunkEvent array.
 * Returns empty array for unrecognized or partial lines.
 */
export function parseSSELine(line: string): ChunkEvent[] {
  if (!line.startsWith('data: ')) {
    return [];
  }
  const payload = line.slice(6).trim();
  if (payload === '[DONE]') {
    return [];
  }

  let chunk: OAIChunk;
  try {
    chunk = JSON.parse(payload) as OAIChunk;
  } catch {
    return [];
  }

  const events: ChunkEvent[] = [];

  // Usage chunk (choices: [])
  if (chunk.usage && (!chunk.choices || chunk.choices.length === 0)) {
    events.push({ type: 'usage', usage: chunk.usage });
  }

  if (chunk.timings) {
    events.push({ type: 'timings', timings: chunk.timings });
  }

  for (const choice of chunk.choices ?? []) {
    const delta = choice.delta ?? {};

    if (delta.content) {
      events.push({ type: 'text_delta', text: delta.content });
    }

    if (delta.reasoning_content) {
      events.push({ type: 'reasoning_delta', text: delta.reasoning_content });
    }

    if (delta.tool_calls) {
      for (const frag of delta.tool_calls) {
        events.push({
          type: 'tool_call_delta',
          choiceIndex: choice.index,
          toolIndex: frag.index,
          fragment: frag
        });
      }
    }

    if (choice.finish_reason != null) {
      events.push({ type: 'finish', finishReason: choice.finish_reason });
    }
  }

  return events;
}

/**
 * Apply a ChunkEvent to the mutable PendingAssistantTurn state.
 */
export function applyChunkEvent(turn: PendingAssistantTurn, event: ChunkEvent): void {
  switch (event.type) {
    case 'text_delta':
      turn.visibleText += event.text;
      break;

    case 'reasoning_delta':
      turn.reasoningText += event.text;
      // Paragraph splitting: seal completed paragraphs
      sealCompletedParagraphs(turn);
      break;

    case 'tool_call_delta':
      assembleToolCallFragment(turn, event.choiceIndex, event.toolIndex, event.fragment);
      break;

    case 'finish':
      turn.finishReason = event.finishReason;
      // Seal any remaining reasoning paragraph as Incomplete
      sealRemainingReasoningParagraph(turn);
      break;

    case 'usage':
      turn.usage = event.usage;
      break;

    case 'timings':
      turn.timings = event.timings;
      break;
  }
}

/**
 * Detects and seals completed (double-newline-terminated) reasoning paragraphs.
 */
function sealCompletedParagraphs(turn: PendingAssistantTurn): void {
  const parts = turn.reasoningText.split(/\n\n+/u);
  if (parts.length <= 1) {
    return;
  } // no completed paragraph yet

  // All parts except the last are completed paragraphs
  const completed = parts.slice(0, parts.length - 1);
  const remaining = parts[parts.length - 1];

  for (const para of completed) {
    const text = para.trim();
    if (!text) {
      continue;
    }

    const alreadySealed = turn.reasoningSteps.some(s => s.text === text);
    if (!alreadySealed) {
      const position = turn.reasoningSteps.length + 1;
      turn.reasoningSteps.push({ text, position, status: 'Published' });
    }
  }

  // Retain only the in-progress paragraph
  turn.reasoningText = remaining;
}

function sealRemainingReasoningParagraph(turn: PendingAssistantTurn): void {
  const text = turn.reasoningText.trim();
  if (!text) {
    return;
  }
  const position = turn.reasoningSteps.length + 1;
  turn.reasoningSteps.push({ text, position, status: 'Published' });
  turn.reasoningText = '';
}

function assembleToolCallFragment(
  turn: PendingAssistantTurn,
  choiceIndex: number,
  toolIndex: number,
  fragment: OAIToolCallFragment
): void {
  let choiceMap = turn.toolCallAssembly.get(choiceIndex);
  if (!choiceMap) {
    choiceMap = new Map();
    turn.toolCallAssembly.set(choiceIndex, choiceMap);
  }

  let assembly = choiceMap.get(toolIndex);
  if (!assembly) {
    assembly = { argumentsText: '' };
    choiceMap.set(toolIndex, assembly);
  }

  if (fragment.id) {
    assembly.id = fragment.id;
  }
  if (fragment.type) {
    assembly.type = fragment.type;
  }
  if (fragment.function?.name) {
    assembly.name = fragment.function.name;
  }
  if (fragment.function?.arguments) {
    assembly.argumentsText += fragment.function.arguments;
  }
}

/**
 * Extract finalized tool calls from the assembly map.
 * Returns parsed call objects or throws if any arguments are invalid JSON.
 */
export function extractToolCalls(turn: PendingAssistantTurn): Array<{ id: string; name: string; arguments: unknown }> {
  const results: Array<{ id: string; name: string; arguments: unknown }> = [];

  for (const [, choiceMap] of turn.toolCallAssembly) {
    for (const [, assembly] of choiceMap) {
      if (!assembly.id || !assembly.name) {
        continue;
      }
      let args: unknown;
      try {
        args = JSON.parse(assembly.argumentsText);
      } catch {
        throw new Error(`Tool call ${assembly.name} has invalid JSON arguments: ${assembly.argumentsText}`);
      }
      results.push({ id: assembly.id, name: assembly.name, arguments: args });
    }
  }

  return results;
}

/** Create a fresh PendingAssistantTurn */
export function createPendingTurn(rootStreamId: string): PendingAssistantTurn {
  return {
    rootStreamId,
    visibleText: '',
    reasoningText: '',
    reasoningSteps: [],
    toolCallAssembly: new Map(),
    finishReason: null,
    streamSequence: 0,
    suggestedActions: [],
    citations: []
  };
}
