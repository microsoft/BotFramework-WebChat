/**
 * The most generic type of item.
 *
 * This is partial implementation of https://schema.org/Thing.
 *
 * @see https://schema.org/Thing
 */
export type OrgSchemaThing<T extends string = string> = {
  '@context': 'https://schema.org';
  '@type': T;
  type: `https://schema.org/${T}`;
};
