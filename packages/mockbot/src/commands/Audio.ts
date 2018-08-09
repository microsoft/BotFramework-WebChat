import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    channelId: 'webchat',
    text: '',
    attachments: [
      {
        contentType: 'audio/mpeg',
        contentUrl: `${ PUBLIC_URL }assets/bftest.mp3`,
        name: 'BotFramework Test'
      }
    ]
  });
}
