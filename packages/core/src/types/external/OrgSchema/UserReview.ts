import { intersect, lazy, object, parse, string, type GenericSchema } from 'valibot';

import jsonLinkedDataProperty from './private/jsonLinkedDataProperty';
import { thingSchema, type ThingInput, type ThingOutput } from './Thing';
import { jsonLinkedDataEntries } from './JSONLinkedData';

/**
 * A review created by an end-user (e.g. consumer, purchaser, attendee etc.), in contrast with [`CriticReview`](https://schema.org/CriticReview).
 *
 * This is partial implementation of https://schema.org/UserReview.
 *
 * @see https://schema.org/UserReview
 */
type UserReviewInput = ThingInput & {
  /**
   * This Review or Rating is relevant to this part or facet of the itemReviewed.
   */
  readonly reviewAspect?: string | readonly string[] | undefined;
};

/**
 * A review created by an end-user (e.g. consumer, purchaser, attendee etc.), in contrast with [`CriticReview`](https://schema.org/CriticReview).
 *
 * This is partial implementation of https://schema.org/UserReview.
 *
 * @see https://schema.org/UserReview
 */
type UserReviewOutput = ThingOutput & {
  /**
   * This Review or Rating is relevant to this part or facet of the itemReviewed.
   */
  readonly reviewAspect: readonly string[];
};

const userReviewEntries = {
  ...jsonLinkedDataEntries,
  reviewAspect: jsonLinkedDataProperty(string())
};

const userReviewSchema: GenericSchema<UserReviewInput, UserReviewOutput> = intersect([
  lazy(() => thingSchema),
  object(userReviewEntries)
]);

/** @deprecated Use Valibot.parse(userReviewSchema) instead. Will be removed on or after 2028-04-23. */
const parseUserReview = (userReview: UserReviewInput): UserReviewOutput => parse(userReviewSchema, userReview);

export { parseUserReview, userReviewEntries, userReviewSchema, type UserReviewInput, type UserReviewOutput };
