import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.animation',
      content: {
        title: 'title',
        subtitle: 'animation',
        text: 'No buttons, No Image, Autoloop, Autostart, Sharable',
        media: [{
          profile: 'animation',
          url: `${ PUBLIC_URL }assets/surface_anim.gif`,
        }],
        autoloop: true,
        autostart: true
      }
    }]
  });
}
