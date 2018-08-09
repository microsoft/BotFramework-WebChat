import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.audio',
      content: {
        title: 'BotFramework Test',
        subtitle: 'audio test',
        text: 'No buttons, No Image, Autoloop, Autostart, Sharable',
        media: [{
          profile: 'audiocard',
          url: `${ PUBLIC_URL }assets/bftest.mp3`
        }],
        autoloop: true,
        autostart: true
      }
    }]
  });
}
