import { any, array, literal, object, optional, parse, pipe, readonly, string, type InferOutput } from 'valibot';
import { sendBoxAttachmentSchema, type SendBoxAttachment } from '../types/SendBoxAttachment';

const SEND_MESSAGE = 'WEB_CHAT/SEND_MESSAGE';

type SendMessageActionFactoryInit = {
  readonly attachments?: readonly SendBoxAttachment[] | undefined;
  readonly channelData?: any;
  readonly replyToId?: string | undefined;
};

const sendMessageActionSchema = pipe(
  object({
    type: literal(SEND_MESSAGE),
    payload: pipe(
      object({
        attachments: optional(pipe(array(sendBoxAttachmentSchema), readonly())),
        channelData: optional(any()),
        replyToId: optional(string()),
        method: optional(string()),
        text: optional(string())
      }),
      readonly()
    )
  }),
  readonly()
);

type SendMessageAction = InferOutput<typeof sendMessageActionSchema>;

function sendMessage(
  text: string | undefined,
  method: string | undefined,
  { attachments, channelData, replyToId }: SendMessageActionFactoryInit = {}
): SendMessageAction {
  return parse(sendMessageActionSchema, {
    payload: {
      attachments,
      channelData,
      method,
      replyToId,
      text
    },
    type: SEND_MESSAGE
  });
}

export default sendMessage;
export { SEND_MESSAGE, sendMessageActionSchema, type SendMessageAction, type SendMessageActionFactoryInit };
