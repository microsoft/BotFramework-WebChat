import { intersect, lazy, looseObject, parse, pipe, readonly, string, type GenericSchema } from 'valibot';

import { actionStatusSchema, type ActionStatusInput, type ActionStatusOutput } from './ActionStatus';
import orgSchemaProperties from './private/orgSchemaProperties';
import { projectSchema, type ProjectInput, type ProjectOutput } from './Project';
import { thingSchema, type ThingInput, type ThingOutput } from './Thing';
import { userReviewSchema, type UserReviewInput, type UserReviewOutput } from './UserReview';

/**
 * An action performed by a direct agent and indirect participants upon a direct object. Optionally happens at a location with the help of an inanimate instrument. The execution of the action may produce a result. Specific action sub-type documentation specifies the exact expectation of each argument/role.
 *
 * See also [blog post](http://blog.schema.org/2014/04/announcing-schemaorg-actions.html) and [Actions overview document](https://schema.org/docs/actions.html).
 *
 * This is partial implementation of https://schema.org/Action.
 *
 * @see https://schema.org/Action
 */
type ActionInput = ThingInput & {
  /**
   * A sub property of object. The options subject to this action. Supersedes [`option`](https://schema.org/option).
   */
  readonly actionOption?: string | ThingInput | readonly (string | ThingInput)[] | undefined;

  /**
   * Indicates the current disposition of the Action.
   *
   * @see https://schema.org/actionStatus
   */
  readonly actionStatus?: ActionStatusInput | readonly ActionStatusInput[] | undefined;

  /**
   * The service provider, service operator, or service performer; the goods producer. Another party (a seller) may offer those services or goods on behalf of the provider. A provider may also serve as the seller. Supersedes [carrier](https://schema.org/carrier).
   *
   * @see https://schema.org/provider
   */
  readonly provider?: ProjectInput | readonly ProjectInput[] | undefined;

  /**
   * The result produced in the action. E.g. John wrote *a book*.
   */
  readonly result?: ThingInput | UserReviewInput | readonly (ThingInput | UserReviewInput)[] | undefined;
};

/**
 * An action performed by a direct agent and indirect participants upon a direct object. Optionally happens at a location with the help of an inanimate instrument. The execution of the action may produce a result. Specific action sub-type documentation specifies the exact expectation of each argument/role.
 *
 * See also [blog post](http://blog.schema.org/2014/04/announcing-schemaorg-actions.html) and [Actions overview document](https://schema.org/docs/actions.html).
 *
 * This is partial implementation of https://schema.org/Action.
 *
 * @see https://schema.org/Action
 */
type ActionOutput = ThingOutput & {
  /**
   * A sub property of object. The options subject to this action. Supersedes [`option`](https://schema.org/option).
   */
  readonly actionOption?: readonly (string | ThingOutput)[] | undefined;

  /**
   * Indicates the current disposition of the Action.
   *
   * @see https://schema.org/actionStatus
   */
  readonly actionStatus?: readonly ActionStatusOutput[] | undefined;

  /**
   * The service provider, service operator, or service performer; the goods producer. Another party (a seller) may offer those services or goods on behalf of the provider. A provider may also serve as the seller. Supersedes [carrier](https://schema.org/carrier).
   *
   * @see https://schema.org/provider
   */
  readonly provider?: readonly ProjectOutput[] | undefined;

  /**
   * The result produced in the action. E.g. John wrote *a book*.
   */
  readonly result?: readonly (ThingOutput | UserReviewOutput)[] | undefined;
};

const actionSchema: GenericSchema<ActionInput, ActionOutput> = intersect([
  thingSchema,
  pipe(
    looseObject({
      actionOption: orgSchemaProperties(string()),
      actionStatus: orgSchemaProperties(actionStatusSchema),
      provider: orgSchemaProperties(lazy(() => projectSchema)),
      result: orgSchemaProperties(userReviewSchema)
    }),
    readonly()
  )
]);

/** @deprecated Use Valibot.parse(actionSchema) instead. Will be removed on or after 2028-04-23. */
const parseAction = (action: ActionInput): ActionOutput => parse(actionSchema, action);

export { actionSchema, parseAction, type ActionInput, type ActionOutput };
