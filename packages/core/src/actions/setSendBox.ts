import { literal, object, pipe, string, type InferOutput } from 'valibot';

const SET_SEND_BOX = 'WEB_CHAT/SET_SEND_BOX';

const setSendBoxActionSchema = pipe(
  object({
    payload: pipe(object({ text: string() })),
    type: literal(SET_SEND_BOX)
  })
);

type SetSendBoxAction = InferOutput<typeof setSendBoxActionSchema>;

function setSendBox(text: string): SetSendBoxAction {
  return {
    payload: { text },
    type: SET_SEND_BOX
  };
}

export default setSendBox;
export { SET_SEND_BOX, setSendBoxActionSchema, type SetSendBoxAction };
