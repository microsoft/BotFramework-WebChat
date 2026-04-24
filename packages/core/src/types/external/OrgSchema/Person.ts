import { intersect, lazy, object, parse, pipe, readonly, string, type GenericSchema } from 'valibot';
import { thingSchema, type ThingInput, type ThingOutput } from './Thing';
import orgSchemaProperties from './private/orgSchemaProperties';

/**
 * A person (alive, dead, undead, or fictional).
 *
 * This is partial implementation of https://schema.org/Person.
 *
 * @see https://schema.org/Person
 */
type PersonInput = ThingInput & {
  /**
   * An image of the item. This can be a [URL](https://schema.org/URL) or a fully described [ImageObject](https://schema.org/ImageObject).
   *
   * Note: `ImageObject` is not supported.
   *
   * @see https://schema.org/image
   */
  readonly image?: string | readonly string[] | undefined;
};

/**
 * A person (alive, dead, undead, or fictional).
 *
 * This is partial implementation of https://schema.org/Person.
 *
 * @see https://schema.org/Person
 */
type PersonOutput = ThingOutput & {
  /**
   * An image of the item. This can be a [URL](https://schema.org/URL) or a fully described [ImageObject](https://schema.org/ImageObject).
   *
   * Note: `ImageObject` is not supported.
   *
   * @see https://schema.org/image
   */
  readonly image: readonly string[];
};

const personSchema: GenericSchema<PersonInput, PersonOutput> = intersect([
  lazy(() => thingSchema),
  pipe(
    object({
      description: orgSchemaProperties(string()),
      image: orgSchemaProperties(string()),
      name: orgSchemaProperties(string())
    }),
    readonly()
  )
]);

/** @deprecated Use Valibot.parse(personSchema) instead. Will be removed on or after 2028-04-23. */
const parsePerson = (person: PersonInput): PersonOutput => parse(personSchema, person);

export { parsePerson, personSchema, type PersonInput, type PersonOutput };
