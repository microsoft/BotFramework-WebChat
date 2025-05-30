import { array, custom, pipe, readonly, type InferOutput } from 'valibot';

// TODO: Resolve possibly cyclic dependency by moving `types` into a separate package.
// import { type DirectLineCardAction } from '../../types/external/DirectLineCardAction';

// const suggestedActionsStateSchema = pipe(array(custom<DirectLineCardAction>(() => true)), readonly());
const suggestedActionsStateSchema = pipe(array(custom<any>(() => true)), readonly());

type SuggestedActionsState = InferOutput<typeof suggestedActionsStateSchema>;

export { suggestedActionsStateSchema, type SuggestedActionsState };
