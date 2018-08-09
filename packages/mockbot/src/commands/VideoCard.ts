import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.video',
      content: {
        title: 'Microsoft Band',
        subtitle: 'Large Video',
        text: 'No buttons, No Image, Autoloop, Autostart, No Sharable',
        media: [{
          url: `${ PUBLIC_URL }assets/msband.mp4`,
          profile: 'videocard'
        }],
        image: { url: `${ PUBLIC_URL }assets/ms-band1.jpg` },
        autoloop: true,
        autostart: true
      }
    }]
  });
}
