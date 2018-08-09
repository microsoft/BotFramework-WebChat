import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext, _: string, provider: string) {
  const { PUBLIC_URL } = process.env;

  switch (provider) {
    case 'vimeo':
      return await context.sendActivity({
        type: 'message',
        attachments: [{
          contentType: 'video/mp4',
          contentUrl: 'https://vimeo.com/269316124',
          name: 'Microsoft Surface Hub 2 (2018)'
        }]
      });

    case 'youtube':
      return await context.sendActivity({
        type: 'message',
        attachments: [{
          contentType: 'video/mp4',
          contentUrl: 'https://www.youtube.com/watch?v=krRRskzHWFE',
          name: 'Introducing Microsoft Surface Go'
        }]
      });

    default:
      return await context.sendActivity({
        type: 'message',
        attachments: [{
          contentType: 'video/mp4',
          contentUrl: `${ PUBLIC_URL }assets/msband.mp4`,
          name: 'Microsoft Band 2'
        }]
      });
  }
}
