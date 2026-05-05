import { intersect, lazy, object, parser, pipe, readonly, string, transform, type GenericSchema } from 'valibot';
import jsonLinkedDataProperty from '../private/jsonLinkedDataProperty';
import { thingSchema, type ThingInput, type ThingOutput } from './Thing';

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

const personSchema: GenericSchema<PersonInput, PersonOutput> = pipe(
  intersect([
    pipe(
      lazy(() => thingSchema),
      // TODO: `intersect()` seems doesn't like frozen objects.
      //       Related to https://github.com/open-circle/valibot/pull/1463.
      transform(value => ({ ...value }))
    ),
    object({
      description: jsonLinkedDataProperty(string()),
      image: jsonLinkedDataProperty(string()),
      name: jsonLinkedDataProperty(string())
    })
  ]),
  readonly(),
  transform(value => Object.freeze({ ...value }))
);

/** @deprecated Use Valibot.parse(personSchema) instead. Will be removed on or after 2028-04-23. */
const parsePerson: (person: PersonInput) => PersonOutput = parser(personSchema);

export { parsePerson, personSchema, type PersonInput, type PersonOutput };
