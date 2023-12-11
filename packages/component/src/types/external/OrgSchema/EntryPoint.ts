import { isThingOf, type Thing } from './Thing';

/**
 * An entry point, within some Web-based protocol.
 *
 * This is partial implementation of https://schema.org/EntryPoint.
 *
 * @see https://schema.org/EntryPoint
 */
export type EntryPoint = Thing<'EntryPoint'> &
  Readonly<{
    /** Indicates the current disposition of the Action. */
    actionPlatform?: string | undefined | URL;

    /** An url template (RFC6570) that will be used to construct the target of the execution of the action. */
    urlTemplate?: string | undefined;
  }>;

export function isEntryPoint(thing: unknown, currentContext?: string): thing is EntryPoint {
  return isThingOf(thing, 'EntryPoint', currentContext);
}
