import { intersect, lazy, object, parser, pipe, readonly, string, transform, type GenericSchema } from 'valibot';
import jsonLinkedDataProperty from '../private/jsonLinkedDataProperty';
import { actionSchema, type ActionInput, type ActionOutput } from './Action';

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

const voteActionSchema: GenericSchema<VoteActionInput, VoteActionOutput> = pipe(
  intersect([
    pipe(
      lazy(() => actionSchema),
      // TODO: `intersect()` seems doesn't like frozen objects.
      //       Related to https://github.com/open-circle/valibot/pull/1463.
      transform(value => ({ ...value }))
    ),
    object({
      actionOption: jsonLinkedDataProperty(string())
    })
  ]),
  readonly(),
  transform(value => Object.freeze({ ...value }))
);

/** @deprecated Use Valibot.parse(voteActionSchema) instead. Will be removed on or after 2028-04-23. */
const parseVoteAction: (voteAction: VoteActionInput) => VoteActionOutput = parser(voteActionSchema);

export { parseVoteAction, voteActionSchema, type VoteActionInput, type VoteActionOutput };
