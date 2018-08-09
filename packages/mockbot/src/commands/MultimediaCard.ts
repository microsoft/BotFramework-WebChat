import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.animation',
      content: {
        title: 'Multimedia Content',
        subtitle: 'Subtitle',
        text: 'Text',
        media: [
          { url: `${ PUBLIC_URL }assets/surface_anim.gif`, profile: 'animation' },
          { url: `${ PUBLIC_URL }assets/surface_anim.gif`, profile: 'animation2' }
        ],
        autoloop: true,
        autostart: true
      }
    }, {
      contentType: 'application/vnd.microsoft.card.audio',
      content: {
        title: 'BotFramework Test',
        subtitle: 'audio test',
        text: 'No buttons, No Image, Autoloop, Autostart, Sharable',
        media: [
          { url: `${ PUBLIC_URL }assets/bftest.mp3`, profile: 'audiocard' },
          { url: `${ PUBLIC_URL }assets/bftest.mp3`, profile: 'audiocard2' }
        ],
        autoloop: true,
        autostart: true
      }
    }, {
      contentType: 'application/vnd.microsoft.card.video',
      content: {
        title: 'Microsoft Band',
        subtitle: 'Large Video',
        text: 'No buttons, No Image, Autoloop, Autostart, No Sharable',
        media: [
          { url: `${ PUBLIC_URL }assets/msband.mp4`, profile: 'videocard' },
          { url: `${ PUBLIC_URL }assets/msband.mp4`, profile: 'videocard2' }
        ],
        image: { url: `${ PUBLIC_URL }assets/ms-band1.jpg` },
        autoloop: true,
        autostart: true
      }
    }]
  });
}
