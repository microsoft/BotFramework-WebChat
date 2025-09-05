import { lazy, parse, type ObjectEntries } from 'valibot';

import { creativeWork, type CreativeWork } from './CreativeWork';
import { project, type Project } from './Project';
import orgSchemaProperty from './private/orgSchemaProperty';

/**
 * A [Claim](https://schema.org/Claim) in Schema.org represents a specific, factually-oriented claim that could be the [itemReviewed](https://schema.org/itemReviewed) in a [ClaimReview](https://schema.org/ClaimReview). The content of a claim can be summarized with the [text](https://schema.org/text) property. Variations on well known claims can have their common identity indicated via [sameAs](https://schema.org/sameAs) links, and summarized with a name. Ideally, a [Claim](https://schema.org/Claim) description includes enough contextual information to minimize the risk of ambiguity or inclarity. In practice, many claims are better understood in the context in which they appear or the interpretations provided by claim reviews.
 *
 * Beyond [ClaimReview](https://schema.org/ClaimReview), the Claim type can be associated with related creative works - for example a [ScholarlyArticle](https://schema.org/ScholarlyArticle) or [Question](https://schema.org/Question) might be about some [Claim](https://schema.org/Claim).
 *
 * This is partial implementation of https://schema.org/Claim.
 *
 * @see https://schema.org/Claim.
 */
export type Claim = CreativeWork & {
  /**
   * Indicates an occurrence of a [Claim](https://schema.org/Claim) in some [CreativeWork](https://schema.org/CreativeWork).
   *
   * @see https://schema.org/appearance.
   */
  appearance?: CreativeWork | undefined;

  /**
   * For a [Claim](https://schema.org/Claim) interpreted from [MediaObject](https://schema.org/MediaObject) content sed to indicate a claim contained, implied or refined from the content of a [MediaObject](https://schema.org/MediaObject).
   *
   * @see https://schema.org/claimInterpreter.
   */
  claimInterpreter?: Project | undefined;
};

export const claim = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  creativeWork({
    appearance: orgSchemaProperty(lazy(() => creativeWork())),
    claimInterpreter: orgSchemaProperty(lazy(() => project())),

    ...entries
  });

export const parseClaim = (data: unknown): Claim => parse(claim(), data);
