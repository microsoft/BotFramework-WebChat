import { pipe, readonly, strictObject, type InferOutput } from 'valibot';
import { identifierSchema } from './NodeIdentifier.ts';

const nodeReferenceSchema = pipe(
  strictObject({ '@id': identifierSchema }, 'Node reference must not contains any properties'),
  readonly()
);

type NodeReference = InferOutput<typeof nodeReferenceSchema>;

export { nodeReferenceSchema, type NodeReference };
