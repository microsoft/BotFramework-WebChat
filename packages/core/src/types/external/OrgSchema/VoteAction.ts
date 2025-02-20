import { parse, string, type ObjectEntries } from 'valibot';

import { action, type Action } from './Action';
import orgSchemaProperty from './private/orgSchemaProperty';

/**
 * An action performed by a direct agent and indirect participants upon a direct object. Optionally happens at a location with the help of an inanimate instrument. The execution of the action may produce a result. Specific action sub-type documentation specifies the exact expectation of each argument/role.
 *
 * See also [blog post](http://blog.schema.org/2014/04/announcing-schemaorg-actions.html) and [Actions overview document](https://schema.org/docs/actions.html).
 *
 * This is partial implementation of https://schema.org/Action.
 *
 * @see https://schema.org/Action
 */
export type VoteAction = Action & {
  /**
   * A sub property of object. The options subject to this action. Supersedes [option](https://schema.org/option).
   *
   * @see https://schema.org/VoteAction
   */
  actionOption?: string | undefined;
};

export const voteAction = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  action({
    actionOption: orgSchemaProperty(string()),

    ...entries
  });

export const parseVoteAction = (data: unknown): VoteAction => parse(voteAction(), data);
