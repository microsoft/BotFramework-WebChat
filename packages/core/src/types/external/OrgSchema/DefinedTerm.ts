import { type Thing } from './Thing';

/**
 * A word, name, acronym, phrase, etc. with a formal definition. Often used in the context of category or subject classification, glossaries or dictionaries, product or creative work types, etc. Use the name property for the term being defined, use termCode if the term has an alpha-numeric code allocated, use description to provide the definition of the term.
 *
 * This is partial implementation of https://schema.org/DefinedTerm.
 *
 * @see https://schema.org/DefinedTerm
 */
export type DefinedTerm = Thing<'DefinedTerm'> & {
  /* An additional type for the item, typically used for adding more specific types from external vocabularies in microdata syntax. This is a relationship between something and a class that the thing is in. Typically the value is a URI-identified RDF class, and in this case corresponds to the use of rdf:type in RDF. Text values can be used sparingly, for cases where useful information can be added without their being an appropriate schema to reference. In the case of text values, the class label should follow the schema.org [style guide](https://schema.org/docs/styleguide.html). */
  additionalType?: string;

  /* A code that identifies this [DefinedTerm](https://schema.org/DefinedTerm) within a [DefinedTermSet](https://schema.org/DefinedTermSet). */
  termCode?: string;
};
