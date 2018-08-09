import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'image/jpg',
      contentUrl: `${ PUBLIC_URL }assets/surface1.jpg`,
      name: 'Microsoft Surface'
    }]
  });
}
