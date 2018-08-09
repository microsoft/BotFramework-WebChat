import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'image/sdvg+xml',
      contentUrl: `${ PUBLIC_URL }assets/bf_square.svg`,
      name: 'Microsoft Bot Framework'
    }]
  });
}
