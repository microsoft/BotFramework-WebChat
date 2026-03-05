/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-eq-null */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-magic-numbers */
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConversationStore } from './conversationStore.js';
import { TranscriptSerializer } from './transcriptSerializer.js';
import { ToolOrchestrator } from './toolOrchestrator.js';
import { DlActivityProjector } from './dlActivityProjector.js';
import { parseSSELine, applyChunkEvent, extractToolCalls, createPendingTurn } from './completionRunner.js';
import type {
  AdapterConfig,
  DLActivity,
  DLCardAction,
  OAIMessage,
  OAITool,
  PendingAssistantTurn,
  SchemaOrgEntity
} from './types.js';
import { ConnectionStatus } from './types.js';

export interface IBotConnection {
  connectionStatus$: BehaviorSubject<ConnectionStatus>;
  activity$: Observable<DLActivity>;
  end(): void;
  referenceGrammarId?: string;
  postActivity(activity: DLActivity): Observable<string>;
  getSessionId?: () => Observable<string>;
}

/** Throttle interval for streaming typing emissions (ms) */
const STREAM_THROTTLE_MS = 80;

/**
 * Create an OAI→DL adapter that implements IBotConnection.
 *
 * @param config - Adapter configuration
 * @param orchestrator - Optional ToolOrchestrator; a default one is created if omitted
 */
export function create(config: AdapterConfig, orchestrator?: ToolOrchestrator): IBotConnection {
  const conversationId = config.conversationId ?? `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const botId = config.botId ?? 'bot';
  const botName = config.botName ?? 'Assistant';
  const maxToolRounds = config.maxToolRounds ?? 10;

  const store = new ConversationStore(conversationId);
  const serializer = new TranscriptSerializer(config);
  const tool = orchestrator ?? new ToolOrchestrator();
  const projector = new DlActivityProjector(botId, botName, conversationId);

  const connectionStatus$ = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.Online);
  const activitySubject = new Subject<DLActivity>();
  const activity$ = activitySubject.asObservable();

  let ended = false;

  // ── postActivity ───────────────────────────────────────────────────────

  function postActivity(activity: DLActivity): Observable<string> {
    return new Observable<string>(subscriber => {
      if (ended) {
        subscriber.error(new Error('Connection ended'));
        return;
      }

      // Handle feedback invoke — do not forward to model
      if (activity.type === 'invoke' && activity.name === 'message/submitAction') {
        subscriber.next(activity.id ?? generateId('invoke'));
        subscriber.complete();
        return;
      }

      if (activity.type !== 'message') {
        subscriber.next(activity.id ?? generateId('activity'));
        subscriber.complete();
        return;
      }

      const activityId = activity.id ?? generateId('user-msg');

      // Persist user message to transcript
      store.addUserMessage({
        text: activity.text ?? '',
        attachments: activity.attachments,
        locale: activity.locale,
        activityId
      });

      // Acknowledge the activity as soon as the server sends its first
      // response — not after the full stream is consumed.
      let acknowledged = false;
      const acknowledge = () => {
        if (!acknowledged) {
          // Echo the user activity back on activity$ so WebChat renders it.
          // Stamp id and timestamp if the caller did not provide them.
          activitySubject.next({
            ...activity,
            id: activityId,
            timestamp: new Date().toISOString(),
            conversation: activity.conversation ?? { id: conversationId },
            channelId: activity.channelId ?? 'directline'
          });

          acknowledged = true;
          subscriber.next(activityId);
          subscriber.complete();
        }
      };

      // Run completion rounds as a detached async task; errors after
      // acknowledgement are swallowed here (the stream itself carries them
      // as bot error activities).
      runCompletionLoop(activityId, acknowledge).catch(err => {
        if (!acknowledged) {
          subscriber.error(err);
        }
      });
    });
  }

  // ── Completion round loop ─────────────────────────────────────────────

  async function runCompletionLoop(replyToId: string, acknowledge: () => void): Promise<void> {
    let round = 0;

    // UI mutations accumulate across tool-call rounds so that suggestedActions
    // and citations set in round N are applied to the final message in round N+k.
    let accSuggestedActions: DLCardAction[] = [];
    let accCitations: SchemaOrgEntity[] = [];
    let finalEntity: any = {};

    while (round < maxToolRounds) {
      round++;

      const streamId = generateId('stream');
      const turn = createPendingTurn(streamId);

      // Emit informative typing indicator to signal we're working
      activitySubject.next(projector.buildInformativeTyping());

      const messages = serializer.buildMessages(store.getItems());
      // Only the first round needs to fire the acknowledgement; subsequent
      // rounds (tool-call continuations) are already acknowledged.
      await streamCompletionRound(messages, turn, replyToId, round === 1 ? acknowledge : () => {});

      // Handle tool calls if finish reason is tool_calls
      if (turn.finishReason === 'tool_calls') {
        const calls = extractToolCalls(turn);
        if (calls.length === 0) {
          break;
        }

        // Persist assistant turn with tool_calls (no visible text yet)
        store.addAssistantMessage({
          text: turn.visibleText,
          toolCalls: calls.map(c => ({
            id: c.id,
            type: 'function' as const,
            function: { name: c.name, arguments: JSON.stringify(c.arguments) }
          })),
          usage: turn.usage,
          timings: turn.timings,
          suggestedActions: [],
          citations: []
        });

        // Execute tools
        const toolResults = await tool.executeAll(calls);

        for (const res of toolResults) {
          if (res.uiMutation) {
            // Accumulate UI mutations across rounds — last write per type wins.
            // These will be attached to the final assistant message once the
            // model finishes generating its text response.
            if (res.uiMutation.type === 'set_suggested_actions') {
              accSuggestedActions = res.uiMutation.actions;
            } else if (res.uiMutation.type === 'set_citations') {
              accCitations = res.uiMutation.citations;
            } else if (res.uiMutation.type === 'set_message_entity_fields') {
              finalEntity = Object.assign(finalEntity, res.uiMutation.entity);
            }
          }

          store.addToolResult({
            toolCallId: res.id,
            toolName: res.name,
            result: res.result,
            isError: res.isError,
            renderAsMcp: res.renderAsMcp
          });
        }

        // Continue to next round
        continue;
      }

      // Terminal: persist final assistant message
      const howToId = `_:h-${streamId}`;

      // Emit sealed reasoning steps to store
      for (const step of turn.reasoningSteps) {
        store.addReasoningStep({
          text: step.text,
          position: step.position,
          howToId,
          status: step.status
        });
      }

      // Merge UI mutations from previous tool-call rounds with any that may
      // have been set in this final round (turn.suggestedActions/citations).
      const finalSuggestedActions = [
        ...accSuggestedActions,
        ...turn.suggestedActions.filter(a => !accSuggestedActions.includes(a))
      ];
      const finalCitations = [...accCitations, ...turn.citations.filter(c => !accCitations.includes(c))];

      const finalItem = store.addAssistantMessage({
        text: turn.visibleText,
        toolCalls: [],
        usage: turn.usage,
        timings: turn.timings,
        suggestedActions: finalSuggestedActions,
        citations: finalCitations
      });

      // Emit final DL message — closes the content livestream.
      // Timestamp must be strictly after the last reasoning step so WebChat
      // orders the final message after all reasoning paragraphs.
      const finalActivity = projector.buildFinalMessage({
        item: finalItem,
        replyToId,
        howToId,
        contentStreamId: streamId,
        timestamp: timestampAfter(turn.lastReasoningActivityTimestamp)
      });
      Object.assign(finalActivity.entities.at(0), finalEntity);
      console.log('Final activity', finalActivity);
      activitySubject.next(finalActivity);

      break;
    }
  }

  // ── Stream one OAI round ──────────────────────────────────────────────

  async function streamCompletionRound(
    messages: OAIMessage[],
    turn: PendingAssistantTurn,
    replyToId: string,
    acknowledge: () => void
  ): Promise<void> {
    const url = `${config.baseUrl.replace(/\/$/u, '')}/v1/chat/completions`;
    const howToId = `_:h-${turn.rootStreamId}`;

    // Build the tools list: start with all tools registered in the orchestrator
    // (which always includes the built-in UI mutation tools), then append any
    // extra raw OAI tools from config that are not already in the orchestrator.
    const orcTools = tool.getOAITools();
    const orcNames = new Set(orcTools.map(t => t.function.name));
    const extraTools = (config.tools ?? []).filter((t: OAITool) => !orcNames.has(t.function.name));
    const allTools: OAITool[] = [...orcTools, ...extraTools];

    const body: Record<string, unknown> = {
      model: config.model,
      messages,
      stream: true,
      ...(config.includeUsage ? { stream_options: { include_usage: true } } : {}),
      ...(allTools.length > 0 ? { tools: allTools, tool_choice: 'auto', parallel_tool_calls: true } : {}),
      ...config.defaultRequest
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: ended ? AbortSignal.abort() : undefined
    });

    if (!response.ok) {
      throw new Error(`OAI request failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body from OAI endpoint');
    }

    // Server has accepted the request — acknowledge to the caller immediately.
    acknowledge();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // Throttled typing emission
    let lastEmitAt = 0;
    let lastEmittedReasoningCount = 0;

    const maybeEmitTyping = () => {
      const now = Date.now();
      if (now - lastEmitAt >= STREAM_THROTTLE_MS && turn.visibleText) {
        activitySubject.next(projector.buildTypingRevision(turn, replyToId));
        lastEmitAt = now;
      }
    };

    const emitNewReasoningSteps = () => {
      const steps = turn.reasoningSteps;
      for (let i = lastEmittedReasoningCount; i < steps.length; i++) {
        // eslint-disable-next-line security/detect-object-injection
        const step = steps[i];

        // Each reasoning paragraph is a standalone activity with its own id.
        // It is NOT wired into the content livestream.
        const activity = projector.buildReasoningTyping({
          activityId: generateId('reasoning'),
          replyToId,
          howToId,
          stepText: step.text,
          position: step.position,
          status: undefined
        });
        activitySubject.next(activity);
      }
      lastEmittedReasoningCount = steps.length;
    };

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }

          const events = parseSSELine(trimmed);
          for (const event of events) {
            applyChunkEvent(turn, event);
          }

          // Check for newly sealed reasoning steps
          emitNewReasoningSteps();

          // Throttled visible text streaming
          maybeEmitTyping();
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        const events = parseSSELine(buffer.trim());
        for (const event of events) {
          applyChunkEvent(turn, event);
        }
      }

      // Force final typing update with complete text
      if (turn.visibleText) {
        activitySubject.next(projector.buildTypingRevision(turn, replyToId));
      }

      // Emit any final reasoning steps
      emitNewReasoningSteps();
    } finally {
      reader.releaseLock();
    }
  }

  // ── end ───────────────────────────────────────────────────────────────

  function end(): void {
    if (!ended) {
      ended = true;
      connectionStatus$.next(ConnectionStatus.Ended);
      activitySubject.complete();
    }
  }

  return {
    connectionStatus$,
    activity$,
    end,
    postActivity
  };
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Returns an ISO timestamp that is strictly after `previous`.
 * If `previous` is undefined, returns the current time.
 * Guarantees at least 1 ms advancement so WebChat activity ordering is correct.
 */
function timestampAfter(previous: string | undefined): string {
  const base = previous != null ? new Date(previous).getTime() : Date.now();
  return new Date(Math.max(base + 1, Date.now())).toISOString();
}
