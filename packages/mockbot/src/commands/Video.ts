import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'video/mp4',
      contentUrl: `${ PUBLIC_URL }assets/msband.mp4`,
      name: 'Microsoft Band'
    }]
  });
}
