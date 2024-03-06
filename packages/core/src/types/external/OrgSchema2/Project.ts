import { parse, string, type ObjectEntries, type Output } from 'valibot';

import { thing } from './Thing';
import orgSchemaProperty from './private/orgSchemaProperty';

export const project = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  thing({
    /** A slogan or motto associated with the item. */
    slogan: orgSchemaProperty(string()),

    ...entries
  });

/**
 * An enterprise (potentially individual but typically collaborative), planned to achieve a particular aim. Use properties from [Organization](https://schema.org/Organization), [subOrganization](https://schema.org/subOrganization)/[parentOrganization](https://schema.org/parentOrganization) to indicate project sub-structures.
 *
 * This is partial implementation of https://schema.org/Project.
 *
 * @see https://schema.org/Project
 */
export type Project = Output<ReturnType<typeof project>>;

export const parseProject = (data: unknown): Project => parse(project(), data);
