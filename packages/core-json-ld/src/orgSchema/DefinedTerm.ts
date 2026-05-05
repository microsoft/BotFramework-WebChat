import { intersect, lazy, object, parser, pipe, readonly, string, transform, type GenericSchema } from 'valibot';
import jsonLinkedDataProperty from '../private/jsonLinkedDataProperty';
import { thingSchema, type ThingInput, type ThingOutput } from './Thing';

/**
 * A word, name, acronym, phrase, etc. with a formal definition. Often used in the context of category or subject classification, glossaries or dictionaries, product or creative work types, etc. Use the name property for the term being defined, use termCode if the term has an alpha-numeric code allocated, use description to provide the definition of the term.
 *
 * This is partial implementation of https://schema.org/DefinedTerm.
 *
 * @see https://schema.org/DefinedTerm
 */
type DefinedTermInput = ThingInput & {
  /**
   * A [DefinedTermSet](https://schema.org/DefinedTermSet) that contains this term.
   *
   * @see https://schema.org/inDefinedTermSet
   */
  readonly inDefinedTermSet?: string | readonly string[] | undefined;

  /**
   * A code that identifies this [DefinedTerm](https://schema.org/DefinedTerm) within a [DefinedTermSet](https://schema.org/DefinedTermSet).
   *
   * @see https://schema.org/termCode
   */
  readonly termCode?: string | readonly string[] | undefined;
};

/**
 * A word, name, acronym, phrase, etc. with a formal definition. Often used in the context of category or subject classification, glossaries or dictionaries, product or creative work types, etc. Use the name property for the term being defined, use termCode if the term has an alpha-numeric code allocated, use description to provide the definition of the term.
 *
 * This is partial implementation of https://schema.org/DefinedTerm.
 *
 * @see https://schema.org/DefinedTerm
 */
type DefinedTermOutput = ThingOutput & {
  /**
   * A [DefinedTermSet](https://schema.org/DefinedTermSet) that contains this term.
   *
   * @see https://schema.org/inDefinedTermSet
   */
  readonly inDefinedTermSet: readonly string[];

  /**
   * A code that identifies this [DefinedTerm](https://schema.org/DefinedTerm) within a [DefinedTermSet](https://schema.org/DefinedTermSet).
   *
   * @see https://schema.org/termCode
   */
  readonly termCode: readonly string[];
};

const definedTermSchema: GenericSchema<DefinedTermInput, DefinedTermOutput> = pipe(
  intersect([
    pipe(
      lazy(() => thingSchema),
      // TODO: `intersect()` seems doesn't like frozen objects.
      //       Related to https://github.com/open-circle/valibot/pull/1463.
      transform(value => ({ ...value }))
    ),
    object({
      inDefinedTermSet: jsonLinkedDataProperty(string()),
      termCode: jsonLinkedDataProperty(string())
    })
  ]),
  readonly(),
  transform(value => Object.freeze({ ...value }))
);

/** @deprecated Use Valibot.parse(definedTermSchema) instead. Will be removed on or after 2028-04-23. */
const parseDefinedTerm: (definedTerm: DefinedTermInput) => DefinedTermOutput = parser(definedTermSchema);

export { definedTermSchema, parseDefinedTerm, type DefinedTermInput, type DefinedTermOutput };
