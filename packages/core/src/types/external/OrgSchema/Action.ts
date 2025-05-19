import { lazy, parse, picklist, pipe, string, type ObjectEntries } from 'valibot';

import orgSchemaProperty from './private/orgSchemaProperty';
import { project, type Project } from './Project';
import { thing, type Thing } from './Thing';
import { userReview, type UserReview } from './UserReview';

/**
 * An action performed by a direct agent and indirect participants upon a direct object. Optionally happens at a location with the help of an inanimate instrument. The execution of the action may produce a result. Specific action sub-type documentation specifies the exact expectation of each argument/role.
 *
 * See also [blog post](http://blog.schema.org/2014/04/announcing-schemaorg-actions.html) and [Actions overview document](https://schema.org/docs/actions.html).
 *
 * This is partial implementation of https://schema.org/Action.
 *
 * @see https://schema.org/Action
 */
export type Action = Thing & {
  /**
   * A sub property of object. The options subject to this action. Supersedes [`option`](https://schema.org/option).
   */
  actionOption?: string | Thing;

  /**
   * Indicates the current disposition of the Action.
   *
   * @see https://schema.org/actionStatus
   */
  actionStatus?:
    | 'ActiveActionStatus'
    | 'CompletedActionStatus'
    | 'FailedActionStatus'
    | 'PotentialActionStatus'
    | undefined;

  /**
   * The service provider, service operator, or service performer; the goods producer. Another party (a seller) may offer those services or goods on behalf of the provider. A provider may also serve as the seller. Supersedes [carrier](https://schema.org/carrier).
   *
   * @see https://schema.org/provider
   */
  provider?: Project | undefined;

  /**
   * The result produced in the action. E.g. John wrote *a book*.
   */
  result?: Thing | UserReview | undefined;
};

export const action = <TEntries extends ObjectEntries>(entries?: TEntries | undefined) =>
  thing({
    actionOption: orgSchemaProperty(string()),
    actionStatus: orgSchemaProperty(
      pipe(
        string(),
        picklist(['ActiveActionStatus', 'CompletedActionStatus', 'FailedActionStatus', 'PotentialActionStatus'])
      )
    ),
    provider: orgSchemaProperty(lazy(() => project())),
    result: orgSchemaProperty(userReview()),

    ...entries
  });

export const parseAction = (data: unknown): Action => parse(action(), data);
