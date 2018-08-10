import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.oauth',
      content: {
        text: 'Login to OAuth sample',
        connectionname: 'SampleConnection',
        buttons: [{
          type: 'signin',
          title: 'Sign in to OAuth application'
        }]
      }
    }]
  });
}
