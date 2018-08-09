import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.signin',
      content: {
        text: 'Login to signin sample',
        buttons: [{
          type: 'signin',
          title: 'Signin',
          value: 'https://login.live.com/'
        }]
      }
    }]
  });
}
