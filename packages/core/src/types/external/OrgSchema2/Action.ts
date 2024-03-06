import { parse, string, union, value, type ObjectEntries, type Output, type StringSchema } from 'valibot';

import { thing } from './Thing';
import orgSchemaProperty from './private/orgSchemaProperty';

export const action = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  thing({
    /** Indicates the current disposition of the Action. */
    actionStatus: orgSchemaProperty(
      union([
        string([value('ActiveActionStatus')]) as StringSchema<'ActiveActionStatus'>,
        string([value('CompletedActionStatus')]) as StringSchema<'CompletedActionStatus'>,
        string([value('FailedActionStatus')]) as StringSchema<'FailedActionStatus'>,
        string([value('PotentialActionStatus')]) as StringSchema<'PotentialActionStatus'>
      ])
    ),

    ...entries
  });

/**
 * An action performed by a direct agent and indirect participants upon a direct object. Optionally happens at a location with the help of an inanimate instrument. The execution of the action may produce a result. Specific action sub-type documentation specifies the exact expectation of each argument/role.
 *
 * See also [blog post](http://blog.schema.org/2014/04/announcing-schemaorg-actions.html) and [Actions overview document](https://schema.org/docs/actions.html).
 *
 * This is partial implementation of https://schema.org/Action.
 *
 * @see https://schema.org/Action
 */
export type Action = Output<ReturnType<typeof action>>;

export const parseAction = (data: unknown): Action => parse(action(), data);
