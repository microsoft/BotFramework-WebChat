import { intersect, lazy, object, parse, pipe, readonly, type GenericSchema } from 'valibot';

import { creativeWorkSchema, type CreativeWorkInput, type CreativeWorkOutput } from './CreativeWork';
import { projectSchema, type ProjectInput, type ProjectOutput } from './Project';
import orgSchemaProperties from './private/orgSchemaProperties';

/**
 * A [Claim](https://schema.org/Claim) in Schema.org represents a specific, factually-oriented claim that could be the [itemReviewed](https://schema.org/itemReviewed) in a [ClaimReview](https://schema.org/ClaimReview). The content of a claim can be summarized with the [text](https://schema.org/text) property. Variations on well known claims can have their common identity indicated via [sameAs](https://schema.org/sameAs) links, and summarized with a name. Ideally, a [Claim](https://schema.org/Claim) description includes enough contextual information to minimize the risk of ambiguity or inclarity. In practice, many claims are better understood in the context in which they appear or the interpretations provided by claim reviews.
 *
 * Beyond [ClaimReview](https://schema.org/ClaimReview), the Claim type can be associated with related creative works - for example a [ScholarlyArticle](https://schema.org/ScholarlyArticle) or [Question](https://schema.org/Question) might be about some [Claim](https://schema.org/Claim).
 *
 * This is partial implementation of https://schema.org/Claim.
 *
 * @see https://schema.org/Claim.
 */
type ClaimInput = CreativeWorkInput & {
  /**
   * Indicates an occurrence of a [Claim](https://schema.org/Claim) in some [CreativeWork](https://schema.org/CreativeWork).
   *
   * @see https://schema.org/appearance.
   */
  readonly appearance?: CreativeWorkInput | readonly CreativeWorkInput[] | undefined;

  /**
   * For a [Claim](https://schema.org/Claim) interpreted from [MediaObject](https://schema.org/MediaObject) content sed to indicate a claim contained, implied or refined from the content of a [MediaObject](https://schema.org/MediaObject).
   *
   * @see https://schema.org/claimInterpreter.
   */
  readonly claimInterpreter?: ProjectInput | readonly ProjectInput[] | undefined;
};

/**
 * A [Claim](https://schema.org/Claim) in Schema.org represents a specific, factually-oriented claim that could be the [itemReviewed](https://schema.org/itemReviewed) in a [ClaimReview](https://schema.org/ClaimReview). The content of a claim can be summarized with the [text](https://schema.org/text) property. Variations on well known claims can have their common identity indicated via [sameAs](https://schema.org/sameAs) links, and summarized with a name. Ideally, a [Claim](https://schema.org/Claim) description includes enough contextual information to minimize the risk of ambiguity or inclarity. In practice, many claims are better understood in the context in which they appear or the interpretations provided by claim reviews.
 *
 * Beyond [ClaimReview](https://schema.org/ClaimReview), the Claim type can be associated with related creative works - for example a [ScholarlyArticle](https://schema.org/ScholarlyArticle) or [Question](https://schema.org/Question) might be about some [Claim](https://schema.org/Claim).
 *
 * This is partial implementation of https://schema.org/Claim.
 *
 * @see https://schema.org/Claim.
 */
type ClaimOutput = CreativeWorkOutput & {
  /**
   * Indicates an occurrence of a [Claim](https://schema.org/Claim) in some [CreativeWork](https://schema.org/CreativeWork).
   *
   * @see https://schema.org/appearance.
   */
  readonly appearance: readonly CreativeWorkOutput[];

  /**
   * For a [Claim](https://schema.org/Claim) interpreted from [MediaObject](https://schema.org/MediaObject) content sed to indicate a claim contained, implied or refined from the content of a [MediaObject](https://schema.org/MediaObject).
   *
   * @see https://schema.org/claimInterpreter.
   */
  readonly claimInterpreter: readonly ProjectOutput[];
};

const claimSchema: GenericSchema<ClaimInput, ClaimOutput> = intersect([
  lazy(() => creativeWorkSchema),
  pipe(
    object({
      appearance: orgSchemaProperties(lazy(() => creativeWorkSchema)),
      claimInterpreter: orgSchemaProperties(lazy(() => projectSchema))
    }),
    readonly()
  )
]);

/** @deprecated Use Valibot.parse(claimSchema) instead. Will be removed on or after 2028-04-23. */
const parseClaim = (claim: ClaimInput): ClaimOutput => parse(claimSchema, claim);

export { claimSchema, parseClaim, type ClaimInput, type ClaimOutput };
