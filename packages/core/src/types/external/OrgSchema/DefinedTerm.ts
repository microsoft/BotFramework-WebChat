import { parse, string, type ObjectEntries } from 'valibot';

import { thing, type Thing } from './Thing';
import orgSchemaProperty from './private/orgSchemaProperty';

export const definedTerm = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  thing({
    inDefinedTermSet: orgSchemaProperty(string()),
    termCode: orgSchemaProperty(string()),

    ...entries
  });

/**
 * A word, name, acronym, phrase, etc. with a formal definition. Often used in the context of category or subject classification, glossaries or dictionaries, product or creative work types, etc. Use the name property for the term being defined, use termCode if the term has an alpha-numeric code allocated, use description to provide the definition of the term.
 *
 * This is partial implementation of https://schema.org/DefinedTerm.
 *
 * @see https://schema.org/DefinedTerm
 */
export type DefinedTerm = Thing & {
  /**
   * A [DefinedTermSet](https://schema.org/DefinedTermSet) that contains this term.
   *
   * @see https://schema.org/inDefinedTermSet
   */
  inDefinedTermSet?: string | undefined;

  /**
   * A code that identifies this [DefinedTerm](https://schema.org/DefinedTerm) within a [DefinedTermSet](https://schema.org/DefinedTermSet).
   *
   * @see https://schema.org/termCode
   */
  termCode?: string | undefined;
};

export const parseDefinedTerm = (data: unknown): DefinedTerm => parse(definedTerm(), data);
