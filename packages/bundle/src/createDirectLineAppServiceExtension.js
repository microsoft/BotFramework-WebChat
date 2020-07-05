import { DirectLineStreaming } from 'botframework-directlinejs';

export default function createDirectLineAppServiceExtension({ botAgent, conversationId, domain, token }) {
  return Promise.resolve(
    new DirectLineStreaming({
      botAgent,
      conversationId,
      domain,
      token
    })
  );
}
