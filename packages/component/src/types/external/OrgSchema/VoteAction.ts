import { isThingOf, type Thing } from './Thing';

/**
 * The act of expressing a preference from a fixed/finite/structured set of choices/options.
 *
 * This is partial implementation of https://schema.org/VoteAction.
 *
 * @see https://schema.org/VoteAction
 */
export type VoteAction = Thing<'VoteAction'> & {
  /** A sub property of object. The options subject to this action. Supersedes [option](https://schema.org/option). */
  actionOption?: string;
};

export function isVoteAction(thing: Thing): thing is VoteAction {
  return isThingOf(thing, 'VoteAction');
}
