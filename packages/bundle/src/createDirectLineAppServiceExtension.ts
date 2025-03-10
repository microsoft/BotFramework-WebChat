import { DirectLineStreaming } from 'botframework-directlinejs';

export default function createDirectLineAppServiceExtension({
  botAgent,
  conversationId,
  domain,
  token
}: {
  botAgent?: string;
  conversationId?: string;
  domain?: string;
  token: string;
}): Promise<any> {
  return Promise.resolve(
    new DirectLineStreaming({
      botAgent,
      conversationId,
      domain,
      token
    })
  );
}
