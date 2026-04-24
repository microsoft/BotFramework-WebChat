import { intersect, lazy, object, parse, pipe, readonly, string } from 'valibot';

import orgSchemaProperties from './private/orgSchemaProperties';
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

/**
 * An enterprise (potentially individual but typically collaborative), planned to achieve a particular aim. Use properties from [Organization](https://schema.org/Organization), [subOrganization](https://schema.org/subOrganization)/[parentOrganization](https://schema.org/parentOrganization) to indicate project sub-structures.
 *
 * This is partial implementation of https://schema.org/Project.
 *
 * @see https://schema.org/Project
 */
const projectSchema = intersect([
  lazy(() => thingSchema),
  pipe(
    object({
      /**
       * A slogan or motto associated with the item.
       *
       * @see https://schema.org/slogan
       */
      slogan: orgSchemaProperties(string())
    }),
    readonly()
  )
]);

/** @deprecated Use Valibot.parse(projectSchema) instead. Will be removed on or after 2028-04-23. */
const parseProject = (project: ProjectInput): ProjectOutput => parse(projectSchema, project);

export { parseProject, projectSchema, type ProjectInput, type ProjectOutput };
