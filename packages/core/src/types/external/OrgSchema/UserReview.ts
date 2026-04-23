import { intersect, looseObject, pipe, readonly, string, type GenericSchema } from 'valibot';

import orgSchemaProperty from './private/orgSchemaProperty';
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
  readonly reviewAspect?: string | readonly string[] | undefined;
};

const userReviewSchema: GenericSchema<UserReviewInput, UserReviewOutput> = intersect([
  thingSchema,
  pipe(
    looseObject({
      reviewAspect: orgSchemaProperty(string())
    }),
    readonly()
  )
]);

export { userReviewSchema, type UserReviewInput, type UserReviewOutput };
