import { array, boolean, lazy, null_, number, record, string, union, type GenericSchema } from 'valibot';

type JSONValue = string | number | boolean | null | { readonly [key: string]: JSONValue } | readonly JSONValue[];

const jsonValueSchema: GenericSchema<JSONValue> = lazy(() =>
  union([string(), number(), boolean(), null_(), array(jsonValueSchema), record(string(), jsonValueSchema)])
);

export default jsonValueSchema;
export { type JSONValue };
