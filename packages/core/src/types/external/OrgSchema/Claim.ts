import { type MediaObject } from './MediaObject';
import { type Project } from './Project';
import { type Thing } from './Thing';

/**
 * A [Claim](https://schema.org/Claim) in Schema.org represents a specific, factually-oriented claim that could be the [itemReviewed](https://schema.org/itemReviewed) in a [ClaimReview](https://schema.org/ClaimReview). The content of a claim can be summarized with the [text](https://schema.org/text) property. Variations on well known claims can have their common identity indicated via [sameAs](https://schema.org/sameAs) links, and summarized with a name. Ideally, a [Claim](https://schema.org/Claim) description includes enough contextual information to minimize the risk of ambiguity or inclarity. In practice, many claims are better understood in the context in which they appear or the interpretations provided by claim reviews.
 *
 * Beyond [ClaimReview](https://schema.org/ClaimReview), the Claim type can be associated with related creative works - for example a [ScholarlyArticle](https://schema.org/ScholarlyArticle) or [Question](https://schema.org/Question) might be about some [Claim](https://schema.org/Claim).
 *
 * This is partial implementation of https://schema.org/Claim.
 *
 * @see https://schema.org/Claim.
 */
export type Claim = Thing<'Claim'> & {
  /** A media object that encodes this CreativeWork. This property is a synonym for encoding. */
  associatedMedia?: MediaObject;

  /**
   * For a [Claim](https://schema.org/Claim) interpreted from [MediaObject](https://schema.org/MediaObject) content sed to indicate a claim contained, implied or refined from the content of a [MediaObject](https://schema.org/MediaObject).
   *
   * Currently, we do not support inheritance. Thus, we only support "Project" thing for "claimInterpreter".
   */
  claimInterpreter?: Project;

  /** The name of the item. */
  name?: string;

  /** The textual content of this CreativeWork. */
  text?: string;

  /** URL of the item. */
  url?: string;
};
