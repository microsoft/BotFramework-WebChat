import { ActionStatusType } from './ActionStatusType';
import { EntryPoint } from './EntryPoint';
import { isThingOf, type Thing } from './Thing';
import { Review } from './Review';

/**
 * The act of producing a balanced opinion about the object for an audience. An agent reviews an object with participants resulting in a review.
 *
 * This is partial implementation of https://schema.org/ReviewAction.
 *
 * @see https://schema.org/ReviewAction
 */
export type ReviewAction = Thing<'ReviewAction'> &
  Readonly<{
    /** Indicates the current disposition of the Action. */
    actionStatus?: ActionStatusType | undefined;

    /** A description of the item. */
    description?: string | undefined;

    /** A sub property of result. The review that resulted in the performing of the action. */
    resultReview?: Review | undefined;

    /** Indicates a target EntryPoint, or url, for an Action. */
    target?: EntryPoint | string | undefined;
  }>;

export function isReviewAction(thing: any, currentContext?: string): thing is ReviewAction {
  return isThingOf(thing, 'ReviewAction', currentContext);
}
