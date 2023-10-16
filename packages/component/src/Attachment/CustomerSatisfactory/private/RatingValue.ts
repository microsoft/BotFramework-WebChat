// Rating can be any numbers between 1 and 5.
// eslint-disable-next-line no-magic-numbers
export type RatingValue = 1 | 2 | 3 | 4 | 5;

export function isValid(ratingValue: any): ratingValue is RatingValue {
  // Rating can be any numbers between 1 and 5.
  // eslint-disable-next-line no-magic-numbers
  return typeof ratingValue === 'number' && ratingValue >= 1 && ratingValue <= 5;
}
