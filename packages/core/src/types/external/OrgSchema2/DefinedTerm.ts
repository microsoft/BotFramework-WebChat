import { parse, string, type ObjectEntries, type Output } from 'valibot';

import { thing } from './Thing';
import orgSchemaProperty from './private/orgSchemaProperty';

export const definedTerm = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  thing({
    /** A code that identifies this [DefinedTerm](https://schema.org/DefinedTerm) within a [DefinedTermSet](https://schema.org/DefinedTermSet). */
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
export type DefinedTerm = Output<ReturnType<typeof definedTerm>>;

export const parseDefinedTerm = (data: unknown): DefinedTerm => parse(definedTerm(), data);
