import { type Action } from 'redux';
import { custom, function_, literal, object, safeParse, type InferOutput } from 'valibot';

const REGISTER_ACTION_SINK = 'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK' as const;

const registerActionSinkActionSchema = object({
  payload: object({
    sink: custom<(action: Action) => void>(value => safeParse(function_(), value).success)
  }),
  type: literal(REGISTER_ACTION_SINK)
});

type RegisterActionSinkAction = InferOutput<typeof registerActionSinkActionSchema>;

export default function registerActionSink(sink: (action: Action) => void): RegisterActionSinkAction {
  return {
    payload: { sink },
    type: REGISTER_ACTION_SINK
  } satisfies RegisterActionSinkAction;
}

export { REGISTER_ACTION_SINK, registerActionSinkActionSchema, type RegisterActionSinkAction };
