import { instance, literal, object, pipe, readonly, type BaseIssue, type BaseSchema } from 'valibot';

export default function createMiddlewareActionSchemas<
  const TName extends string,
  const TPayloadSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMetaSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>
>(actionName: TName, payloadSchema: TPayloadSchema, metaSchema: TMetaSchema) {
  return Object.freeze({
    fulfilled: {
      name: `${actionName}_FULFILLED` as const,
      schema: pipe(
        object({
          meta: metaSchema,
          payload: payloadSchema,
          type: literal(`${actionName}_FULFILLED`)
        }),
        readonly()
      )
    },
    impeded: {
      name: `${actionName}_IMPEDED` as const,
      schema: pipe(
        object({
          meta: metaSchema,
          payload: payloadSchema,
          type: literal(`${actionName}_IMPEDED`)
        }),
        readonly()
      )
    },
    pending: {
      name: `${actionName}_PENDING` as const,
      schema: pipe(
        object({
          meta: metaSchema,
          payload: payloadSchema,
          type: literal(`${actionName}_PENDING`)
        }),
        readonly()
      )
    },
    rejected: {
      name: `${actionName}_REJECTED` as const,
      schema: pipe(
        object({
          error: literal(true),
          meta: metaSchema,
          payload: instance(Error),
          type: literal(`${actionName}_REJECTED`)
        }),
        readonly()
      )
    }
  });
}
