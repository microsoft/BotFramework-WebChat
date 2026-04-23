import { intersect, lazy, looseObject, parse, pipe, readonly, string, type GenericSchema } from 'valibot';

import orgSchemaProperties from './private/orgSchemaProperties';
import { thingSchema, type ThingInput, type ThingOutput } from './Thing';

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

const userReviewSchema: GenericSchema<UserReviewInput, UserReviewOutput> = intersect([
  lazy(() => thingSchema),
  pipe(
    looseObject({
      reviewAspect: orgSchemaProperties(string())
    }),
    readonly()
  )
]);

/** @deprecated Use Valibot.parse(userReviewSchema) instead. Will be removed on or after 2028-04-23. */
const parseUserReview = (userReview: UserReviewInput): UserReviewOutput => parse(userReviewSchema, userReview);

export { parseUserReview, userReviewSchema, type UserReviewInput, type UserReviewOutput };
