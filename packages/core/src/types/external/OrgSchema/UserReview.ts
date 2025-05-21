import { parse, string, type ObjectEntries } from 'valibot';

import orgSchemaProperty from './private/orgSchemaProperty';
import { thing, type Thing } from './Thing';

/**
 * A review created by an end-user (e.g. consumer, purchaser, attendee etc.), in contrast with [`CriticReview`](https://schema.org/CriticReview).
 *
 * This is partial implementation of https://schema.org/UserReview.
 *
 * @see https://schema.org/UserReview
 */
export type UserReview = Thing & {
  /**
   * This Review or Rating is relevant to this part or facet of the itemReviewed.
   */
  reviewAspect?: string | undefined;
};

export const userReview = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  thing({
    reviewAspect: orgSchemaProperty(string()),

    ...entries
  });

export const parseUserReview = (data: unknown): UserReview => parse(userReview(), data);
