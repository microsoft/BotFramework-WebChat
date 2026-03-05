/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-magic-numbers */
import type { DLActivity, SchemaOrgEntity, PendingAssistantTurn, AssistantMessageItem } from './types.ts';

/**
 * DlActivityProjector - converts internal state into DL activity wire format.
 *
 * Covers:
 *  - streaming typing revisions (with streamType/streamSequence/streamId)
 *  - reasoning steps projected as HowTo entries in a typing activity
 *  - final message activity with citations, suggested actions, feedback entities
 */
export class DlActivityProjector {
  private readonly botId: string;
  private readonly botName: string;
  private readonly conversationId: string;

  constructor(botId: string, botName: string, conversationId: string) {
    this.botId = botId;
    this.botName = botName;
    this.conversationId = conversationId;
  }

  // ── Streaming typing revision ───────────────────────────────────────────

  buildTypingRevision(turn: PendingAssistantTurn, replyToId: string): DLActivity {
    turn.streamSequence++;

    return {
      type: 'typing',
      // Each revision gets a unique id. The back-reference to the original
      // stream is carried by channelData.streamId — NOT by reusing the
      // stream's own id here (which would create a duplicate-id crash).
      id: `${turn.rootStreamId}-rev-${turn.streamSequence}`,
      text: turn.visibleText,
      textFormat: 'markdown',
      from: { id: this.botId, role: 'bot', name: this.botName },
      conversation: { id: this.conversationId },
      channelId: 'directline',
      replyToId,
      channelData: {
        streamType: 'streaming',
        streamSequence: turn.streamSequence,
        streamId: turn.rootStreamId
      }
    };
  }

  // ── Reasoning step typing activity ─────────────────────────────────────

  /**
   * Emit a standalone typing activity for one sealed reasoning paragraph.
   *
   * These are independent activities — not part of the content livestream.
   * Each has its own unique id and no channelData stream fields so the
   * renderer treats them as discrete bot messages, not stream revisions.
   */
  buildReasoningTyping(params: {
    activityId: string;
    replyToId: string;
    howToId: string;
    stepText: string;
    position: number;
    status: 'Incomplete' | 'Published' | undefined;
  }): DLActivity {
    const { activityId, replyToId, howToId, stepText, position, status } = params;

    const entity: SchemaOrgEntity = {
      '@context': 'https://schema.org',
      '@type': 'Message',
      '@id': '',
      type: 'https://schema.org/Message',
      position,
      isPartOf: { '@id': howToId, '@type': 'HowTo' },
      creativeWorkStatus: status
    };

    // No channelData stream fields — this is a standalone activity,
    // not a revision of any livestream.
    return {
      type: 'typing',
      id: activityId,
      text: stepText,
      textFormat: 'markdown',
      from: { id: this.botId, role: 'bot', name: this.botName },
      conversation: { id: this.conversationId },
      channelId: 'directline',
      timestamp: new Date().toISOString(),
      replyToId,
      entities: [entity]
    };
  }

  // ── Final message activity ──────────────────────────────────────────────

  buildFinalMessage(params: {
    item: AssistantMessageItem;
    replyToId: string;
    howToId: string;
    /** The content stream id — must match the streamId used in typing revisions. */
    contentStreamId: string;
    /**
     * Explicit timestamp for the final activity. Must be strictly after the last
     * reasoning step activity so WebChat orders them correctly. Pass the result
     * of `timestampAfter(lastReasoningActivityTimestamp)` from the caller.
     */
    timestamp: string;
  }): DLActivity {
    const { item, replyToId, contentStreamId, timestamp } = params;
    const entities: SchemaOrgEntity[] = [];

    // Base message entity with AI keywords
    const msgEntity: SchemaOrgEntity = {
      '@context': 'https://schema.org',
      '@type': 'Message',
      '@id': '',
      type: 'https://schema.org/Message',
      keywords: ['AIGeneratedContent', 'AllowCopy'],
      author: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: this.botName
      }
    };

    // Citations
    if (item.citations && item.citations.length > 0) {
      msgEntity.citation = item.citations;
    }

    // Feedback potential actions
    msgEntity.potentialAction = buildFeedbackActions();

    entities.push(msgEntity);

    // Add any extra citation claim entities at top level
    if (item.citations) {
      for (const c of item.citations) {
        entities.push(c);
      }
    }

    const activity: DLActivity = {
      type: 'message',
      id: item.id,
      timestamp,
      text: item.text,
      textFormat: 'markdown',
      from: { id: this.botId, role: 'bot', name: this.botName },
      conversation: { id: this.conversationId },
      channelId: 'directline',
      replyToId,
      entities,
      channelData: {
        streamType: 'final',
        streamId: contentStreamId
      }
    };

    if (item.suggestedActions && item.suggestedActions.length > 0) {
      activity.suggestedActions = {
        to: [],
        actions: item.suggestedActions
      };
    }

    return activity;
  }

  // ── Informative (typing indicator before streaming starts) ──────────────

  buildInformativeTyping(streamId?: string, replyToId?: string): DLActivity {
    return {
      type: 'typing',
      id: streamId,
      from: { id: this.botId, role: 'bot', name: this.botName },
      conversation: { id: this.conversationId },
      channelId: 'directline',
      replyToId,
      channelData: {
        streamType: 'informative',
        streamId
      }
    };
  }
}

function buildFeedbackActions(): SchemaOrgEntity[] {
  return [
    {
      '@type': 'LikeAction',
      actionStatus: 'PotentialActionStatus',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'ms-directline://postback?interaction=like'
      }
    },
    {
      '@type': 'DislikeAction',
      actionStatus: 'PotentialActionStatus',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'ms-directline://postback?interaction=dislike'
      },
      result: {
        '@type': 'Review',
        reviewBody: '',
        'reviewBody-input': {
          '@type': 'PropertyValueSpecification',
          valueMinLength: 0,
          valueName: 'reviewBody'
        }
      }
    }
  ] as SchemaOrgEntity[];
}
