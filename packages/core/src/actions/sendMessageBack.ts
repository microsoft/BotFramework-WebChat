import { any, literal, object, optional, parse, pipe, readonly, string, type InferOutput } from 'valibot';

const SEND_MESSAGE_BACK = 'WEB_CHAT/SEND_MESSAGE_BACK';

const sendMessageBackActionSchema = pipe(
  object({
    payload: pipe(
      object({
        displayText: optional(string()),
        replyToId: optional(string()),
        text: optional(string()),
        value: optional(any())
      }),
      readonly()
    ),
    type: literal(SEND_MESSAGE_BACK)
  }),
  readonly()
);

type SendMessageBackAction = InferOutput<typeof sendMessageBackActionSchema>;
type SendMessageBackActionFactoryInit = { readonly replyToId?: string | undefined };

function sendMessageBack(
  value: any,
  text: string | undefined,
  displayText: string | undefined,
  init?: SendMessageBackActionFactoryInit | undefined
): SendMessageBackAction {
  return parse(sendMessageBackActionSchema, {
    payload: {
      displayText,
      replyToId: init?.replyToId,
      text,
      value
    },
    type: SEND_MESSAGE_BACK
  });
}

export default sendMessageBack;
export {
  SEND_MESSAGE_BACK,
  sendMessageBackActionSchema,
  type SendMessageBackAction,
  type SendMessageBackActionFactoryInit
};
