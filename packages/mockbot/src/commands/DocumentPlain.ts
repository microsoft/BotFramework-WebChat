import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'text/plain',
      contentUrl: `${ PUBLIC_URL }assets/test.txt`,
      name: 'test.txt'
    }]
  });
}
