import { intersect, lazy, object, parse, string, type GenericSchema } from 'valibot';

import { actionSchema, type ActionInput, type ActionOutput } from './Action';
import jsonLinkedDataProperty from './private/jsonLinkedDataProperty';
import { jsonLinkedDataEntries } from './JSONLinkedData';

/**
 * An action performed by a direct agent and indirect participants upon a direct object. Optionally happens at a location with the help of an inanimate instrument. The execution of the action may produce a result. Specific action sub-type documentation specifies the exact expectation of each argument/role.
 *
 * See also [blog post](http://blog.schema.org/2014/04/announcing-schemaorg-actions.html) and [Actions overview document](https://schema.org/docs/actions.html).
 *
 * This is partial implementation of https://schema.org/Action.
 *
 * @see https://schema.org/Action
 */
type VoteActionInput = ActionInput & {
  /**
   * A sub property of object. The options subject to this action. Supersedes [option](https://schema.org/option).
   *
   * @see https://schema.org/VoteAction
   */
  readonly actionOption?: string | readonly string[] | undefined;
};

/**
 * An action performed by a direct agent and indirect participants upon a direct object. Optionally happens at a location with the help of an inanimate instrument. The execution of the action may produce a result. Specific action sub-type documentation specifies the exact expectation of each argument/role.
 *
 * See also [blog post](http://blog.schema.org/2014/04/announcing-schemaorg-actions.html) and [Actions overview document](https://schema.org/docs/actions.html).
 *
 * This is partial implementation of https://schema.org/Action.
 *
 * @see https://schema.org/Action
 */
type VoteActionOutput = ActionOutput & {
  /**
   * A sub property of object. The options subject to this action. Supersedes [option](https://schema.org/option).
   *
   * @see https://schema.org/VoteAction
   */
  readonly actionOption: readonly string[];
};

const voteActionEntries = {
  ...jsonLinkedDataEntries,
  // ...actionEntries,
  actionOption: jsonLinkedDataProperty(string())
};

const voteActionSchema: GenericSchema<VoteActionInput, VoteActionOutput> = intersect([
  lazy(() => actionSchema),
  object(voteActionEntries)
]);

/** @deprecated Use Valibot.parse(voteActionSchema) instead. Will be removed on or after 2028-04-23. */
const parseVoteAction = (voteAction: VoteActionInput): VoteActionOutput => parse(voteActionSchema, voteAction);

export { parseVoteAction, voteActionEntries, voteActionSchema, type VoteActionInput, type VoteActionOutput };
