import { DirectLineStreaming } from 'botframework-directlinejs';

export default function createDirectLineAppServiceExtension({
  botAgent,
  conversationId,
  conversationStartProperties,
  domain,
  token
}: {
  botAgent?: string;
  conversationId?: string;
  conversationStartProperties?: {
    locale?: string;
    user?: {
      id?: string;
      name?: string;
    };
  };
  domain?: string;
  token: string;
}): Promise<any> {
  return Promise.resolve(
    new DirectLineStreaming({
      botAgent,
      conversationId,
      conversationStartProperties,
      domain,
      token
    })
  );
}
