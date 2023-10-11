import { isThingOf, type Thing } from './Thing';

/**
 * An enterprise (potentially individual but typically collaborative), planned to achieve a particular aim. Use properties from [Organization](https://schema.org/Organization), [subOrganization](https://schema.org/subOrganization)/[parentOrganization](https://schema.org/parentOrganization) to indicate project sub-structures.
 *
 * This is partial implementation of https://schema.org/Project.
 *
 * @see https://schema.org/Project
 */
export type Project = Thing<'Project'> & {
  /** The name of the item. */
  name?: string;

  /** 	A slogan or motto associated with the item. */
  slogan?: string;

  /** URL of the item. */
  url?: string;
};

export function isProject(thing: any): thing is Project {
  return isThingOf(thing, 'Project');
}
