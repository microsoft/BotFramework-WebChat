import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    textFormat: 'plain',
    text: 'Message Text',
    suggestedActions: {
      actions: [
        {
          type: 'imBack',
          title: 'Blue',
          value: 'Blue',
          image: `${ PUBLIC_URL }assets/square-icon.png`
        },
        {
          type: 'imBack',
          title: 'Red',
          value: 'Red',
          image: `${ PUBLIC_URL }assets/square-icon-red.png`
        },
        {
          type: 'imBack',
          title: 'Green',
          value: 'Green',
          image: `${ PUBLIC_URL }assets/square-icon-green.png`
        }
      ],
      to: []
    }
  });
}
