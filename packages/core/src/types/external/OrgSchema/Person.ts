import { intersect, looseObject, pipe, readonly, string, type GenericSchema } from 'valibot';
import { thingSchema, type ThingInput, type ThingOutput } from './Thing';
import orgSchemaProperties from './private/orgSchemaProperties';

type PersonInput = ThingInput & {
  readonly description?: string | readonly string[] | undefined;
  readonly image?: string | readonly string[] | undefined;
  readonly name?: string | readonly string[] | undefined;
};

type PersonOutput = ThingOutput & {
  readonly description?: readonly string[] | undefined;
  readonly image?: readonly string[] | undefined;
  readonly name?: readonly string[] | undefined;
};

const personSchema: GenericSchema<PersonInput, PersonOutput> = intersect([
  thingSchema,
  pipe(
    looseObject({
      description: orgSchemaProperties(string()),
      image: orgSchemaProperties(string()),
      name: orgSchemaProperties(string())
    }),
    readonly()
  )
]);

export { personSchema, type PersonInput, type PersonOutput };
