import { picklist, type InferInput, type InferOutput } from 'valibot';

const creativeWorkStatusSchema = picklist(['Incomplete', 'Published']);

type CreativeWorkStatusInput = InferInput<typeof creativeWorkStatusSchema>;
type CreativeWorkStatusOutput = InferOutput<typeof creativeWorkStatusSchema>;

export { creativeWorkStatusSchema, type CreativeWorkStatusInput, type CreativeWorkStatusOutput };
