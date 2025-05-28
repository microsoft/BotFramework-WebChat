import { type Action } from 'redux';
import { custom, function_, literal, object, safeParse, type InferOutput } from 'valibot';

const UNREGISTER_ACTION_SINK = 'WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK' as const;

const unregisterActionSinkActionSchema = object({
  payload: object({
    sink: custom<(action: Action) => void>(value => safeParse(function_(), value).success)
  }),
  type: literal(UNREGISTER_ACTION_SINK)
});

type UnregisterActionSinkAction = InferOutput<typeof unregisterActionSinkActionSchema>;

export default function unregisterActionSink(sink: (action: Action) => void): UnregisterActionSinkAction {
  return {
    payload: { sink },
    type: UNREGISTER_ACTION_SINK
  } satisfies UnregisterActionSinkAction;
}

export { UNREGISTER_ACTION_SINK, unregisterActionSinkActionSchema, type UnregisterActionSinkAction };
