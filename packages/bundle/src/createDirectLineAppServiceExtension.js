import { DirectLineStreaming } from 'botframework-directlinejs';

export default async function createDirectLineAppServiceExtension({ botAgent, conversationId, domain, token }) {
  return new DirectLineStreaming({
    botAgent,
    conversationId,
    domain,
    token
  });
}
