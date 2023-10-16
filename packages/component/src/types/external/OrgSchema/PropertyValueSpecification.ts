import { isThingOf, type Thing } from './Thing';

/**
 * A Property value specification.
 *
 * This is partial implementation of https://schema.org/PropertyValueSpecification.
 *
 * @see https://schema.org/PropertyValueSpecification
 */
export type PropertyValueSpecification = Thing<'PropertyValueSpecification'> &
  Readonly<{
    /** Indicates the name of the PropertyValueSpecification to be used in URL templates and form encoding in a manner analogous to HTML's input@name. */
    valueName?: string | undefined;
  }>;

export type WithInput<T extends Record<string, unknown>> = T &
  Readonly<{
    [K in keyof T as K extends string ? `${K}-input` : K]?: PropertyValueSpecification | undefined;
  }>;

export function isPropertyValueSpecification(thing: any, currentContext?: string): thing is PropertyValueSpecification {
  return isThingOf(thing, 'PropertyValueSpecification', currentContext);
}
