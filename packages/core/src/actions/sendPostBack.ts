export type SendPostBackInit = {
  replyToId?: string | undefined;
};

const SEND_POST_BACK = 'WEB_CHAT/SEND_POST_BACK';

export default function sendPostback(
  value: any,
  init?: SendPostBackInit | undefined
): {
  readonly type: typeof SEND_POST_BACK;
  readonly payload: {
    readonly replyToId: string | undefined;
    readonly value: any;
  };
} {
  return {
    type: SEND_POST_BACK,
    payload: { replyToId: init.replyToId, value }
  };
}

export { SEND_POST_BACK };
