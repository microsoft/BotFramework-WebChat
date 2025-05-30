import { literal, object, pipe, readonly, union, type InferOutput } from 'valibot';

import { suggestedActionsStateSchema } from '../types/suggestedActions';
import { suggestedActionsOriginActivityStateSchema } from '../types/suggestedActionsOriginActivity';

const SET_RAW_STATE = 'WEB_CHAT_INTERNAL/SET_RAW_STATE' as const;

const setRawStateActionSchema = pipe(
  object({
    payload: union([
      pipe(
        object({
          name: literal('suggestedActions'),
          state: suggestedActionsStateSchema
        }),
        readonly()
      ),
      pipe(
        object({
          name: literal('suggestedActionsOriginActivity'),
          state: suggestedActionsOriginActivityStateSchema
        }),
        readonly()
      )
    ]),
    type: literal(SET_RAW_STATE)
  }),
  readonly()
);

type SetRawStateAction = InferOutput<typeof setRawStateActionSchema>;

// Due to limitation of TypeScript, we need to specify overloading functions.
export default function setRawState(
  name: 'suggestedActions',
  state: (SetRawStateAction['payload'] & { name: typeof name })['state']
): SetRawStateAction;

export default function setRawState(
  name: 'suggestedActionsOriginActivity',
  state: (SetRawStateAction['payload'] & { name: typeof name })['state']
): SetRawStateAction;

export default function setRawState(name: SetRawStateAction['payload']['name'], state: any): SetRawStateAction {
  return { payload: { name, state }, type: SET_RAW_STATE };
}

export { SET_RAW_STATE, setRawStateActionSchema, type SetRawStateAction };
