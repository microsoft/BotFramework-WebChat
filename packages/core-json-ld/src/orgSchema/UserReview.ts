import { intersect, lazy, object, parser, pipe, readonly, string, transform, type GenericSchema } from 'valibot';
import jsonLinkedDataProperty from '../private/jsonLinkedDataProperty';
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

const userReviewSchema: GenericSchema<UserReviewInput, UserReviewOutput> = pipe(
  intersect([
    pipe(
      lazy(() => thingSchema),
      // TODO: `intersect()` seems doesn't like frozen objects.
      //       Related to https://github.com/open-circle/valibot/pull/1463.
      transform(value => ({ ...value }))
    ),
    object({
      reviewAspect: jsonLinkedDataProperty(string())
    })
  ]),
  readonly(),
  transform(value => Object.freeze({ ...value }))
);

/** @deprecated Use Valibot.parse(userReviewSchema) instead. Will be removed on or after 2028-04-23. */
const parseUserReview: (userReview: UserReviewInput) => UserReviewOutput = parser(userReviewSchema);

export { parseUserReview, userReviewSchema, type UserReviewInput, type UserReviewOutput };
