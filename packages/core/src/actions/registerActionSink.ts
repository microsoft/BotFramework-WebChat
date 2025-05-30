import { type Action } from 'redux';
import { custom, function_, literal, object, pipe, readonly, safeParse, type InferOutput } from 'valibot';

const REGISTER_ACTION_SINK = 'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK' as const;

const registerActionSinkActionSchema = pipe(
  object({
    payload: pipe(
      object({
        sink: custom<(action: Action) => void>(value => safeParse(function_(), value).success)
      }),
      readonly()
    ),
    type: literal(REGISTER_ACTION_SINK)
  }),
  readonly()
);

type RegisterActionSinkAction = InferOutput<typeof registerActionSinkActionSchema>;

function registerActionSink(sink: (action: Action) => void): RegisterActionSinkAction {
  return {
    payload: { sink },
    type: REGISTER_ACTION_SINK
  };
}

export default registerActionSink;
export { REGISTER_ACTION_SINK, registerActionSinkActionSchema, type RegisterActionSinkAction };
