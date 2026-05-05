import { intersect, lazy, object, parser, pipe, readonly, string, transform, type GenericSchema } from 'valibot';
import jsonLinkedDataProperty from '../private/jsonLinkedDataProperty';
import { thingSchema, type ThingInput, type ThingOutput } from './Thing';

/**
 * An enterprise (potentially individual but typically collaborative), planned to achieve a particular aim. Use properties from [Organization](https://schema.org/Organization), [subOrganization](https://schema.org/subOrganization)/[parentOrganization](https://schema.org/parentOrganization) to indicate project sub-structures.
 *
 * This is partial implementation of https://schema.org/Project.
 *
 * @see https://schema.org/Project
 */
type ProjectInput = ThingInput & {
  /**
   * A slogan or motto associated with the item.
   *
   * @see https://schema.org/slogan
   */
  readonly slogan?: string | readonly string[] | undefined;
};

/**
 * An enterprise (potentially individual but typically collaborative), planned to achieve a particular aim. Use properties from [Organization](https://schema.org/Organization), [subOrganization](https://schema.org/subOrganization)/[parentOrganization](https://schema.org/parentOrganization) to indicate project sub-structures.
 *
 * This is partial implementation of https://schema.org/Project.
 *
 * @see https://schema.org/Project
 */
type ProjectOutput = ThingOutput & {
  /**
   * A slogan or motto associated with the item.
   *
   * @see https://schema.org/slogan
   */
  readonly slogan: readonly string[];
};

const projectSchema: GenericSchema<ProjectInput, ProjectOutput> = pipe(
  intersect([
    pipe(
      lazy(() => thingSchema),
      // TODO: `intersect()` seems doesn't like frozen objects.
      //       Related to https://github.com/open-circle/valibot/pull/1463.
      transform(value => ({ ...value }))
    ),
    object({
      slogan: jsonLinkedDataProperty(string())
    })
  ]),
  readonly(),
  transform(value => Object.freeze({ ...value }))
);

/** @deprecated Use Valibot.parse(projectSchema) instead. Will be removed on or after 2028-04-23. */
const parseProject: (project: ProjectInput) => ProjectOutput = parser(projectSchema);

export { parseProject, projectSchema, type ProjectInput, type ProjectOutput };
