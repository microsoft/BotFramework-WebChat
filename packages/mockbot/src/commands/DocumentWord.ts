import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      contentUrl: `${ PUBLIC_URL }assets/test.docx`,
      name: 'test.docx'
    }]
  });
}
