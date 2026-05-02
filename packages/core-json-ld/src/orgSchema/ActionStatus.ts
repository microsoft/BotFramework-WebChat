import { picklist, type InferInput, type InferOutput } from 'valibot';

const actionStatusSchema = picklist([
  'ActiveActionStatus',
  'CompletedActionStatus',
  'FailedActionStatus',
  'PotentialActionStatus'
]);

type ActionStatusInput = InferInput<typeof actionStatusSchema>;
type ActionStatusOutput = InferOutput<typeof actionStatusSchema>;

export { actionStatusSchema, type ActionStatusInput, type ActionStatusOutput };
