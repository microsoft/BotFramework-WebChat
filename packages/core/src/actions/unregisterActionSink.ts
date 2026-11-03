import { type Action } from 'redux';
import { custom, function_, is, literal, object, pipe, readonly, type InferOutput } from 'valibot';

const UNREGISTER_ACTION_SINK = 'WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK' as const;

const unregisterActionSinkActionSchema = pipe(
  object({
    payload: pipe(
      object({
        sink: custom<(action: Action) => void>(value => is(function_(), value))
      }),
      readonly()
    ),
    type: literal(UNREGISTER_ACTION_SINK)
  }),
  readonly()
);

type UnregisterActionSinkAction = InferOutput<typeof unregisterActionSinkActionSchema>;

function unregisterActionSink(sink: (action: Action) => void): UnregisterActionSinkAction {
  return {
    payload: { sink },
    type: UNREGISTER_ACTION_SINK
  };
}

export default unregisterActionSink;
export { UNREGISTER_ACTION_SINK, unregisterActionSinkActionSchema, type UnregisterActionSinkAction };
