import { isThingOf, type Thing } from './Thing';
import { Rating } from './Rating';

/**
 * A review of an item - for example, of a restaurant, movie, or store.
 *
 * This is partial implementation of https://schema.org/Review.
 *
 * @see https://schema.org/Review
 */
export type Review = Thing<'Review'> &
  Readonly<{
    /**
     * The rating given in this review. Note that reviews can themselves be rated.
     * The `reviewRating` applies to rating given by the review.
     * The [aggregateRating](https://schema.org/aggregateRating) property applies to the review itself, as a creative work.
     */
    reviewRating?: Rating | undefined;
  }>;

export function isReview(thing: unknown, currentContext?: string): thing is Review {
  return isThingOf(thing, 'Review', currentContext);
}
