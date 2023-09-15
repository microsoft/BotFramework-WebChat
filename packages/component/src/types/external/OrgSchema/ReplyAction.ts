import { isThingOf, type Thing } from './Thing';
import { type Project } from './Project';

/**
 * The act of responding to a question/message asked/sent by the object. Related to [AskAction](https://schema.org/AskAction).
 *
 * This is partial implementation of https://schema.org/ReplyAction.
 *
 * @see https://schema.org/ReplyAction
 */
export type ReplyAction = Thing<'ReplyAction'> & {
  /** A description of the item. */
  description?: string;

  /** The service provider, service operator, or service performer; the goods producer. Another party (a seller) may offer those services or goods on behalf of the provider. A provider may also serve as the seller. Supersedes [carrier](https://schema.org/carrier). */
  provider?: Project;
};

export function isReplyAction(thing: Thing): thing is ReplyAction {
  return isThingOf(thing, 'ReplyAction');
}
