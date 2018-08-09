import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  const { PUBLIC_URL } = process.env;

  await context.sendActivity({
    type: 'message',
    text: '',
    attachmentLayout: 'carousel',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.receipt',
      content: {
        title: 'Surface Pro 4',
        subtitle: 'This is the subtitle',
        items: [{
          title: 'Surface Pro 4',
          subtitle: 'Surface Pro 4 is a powerful, versatile, lightweight laptop.',
          text: 'Surface does more. Just like you. For one device that does everything, you need more than a mobile OS.',
          image: {
            url: `${ PUBLIC_URL }assets/surface1.jpg`,
            alt: 'Microsoft Surface Alt',
            tap: {
              type: 'openUrl',
              title: 'Tapped it!',
              value: `${ PUBLIC_URL }testurl1.html`
            }
          },
          price: '$XXX'
        }, {
          title: 'Surface Pro 4 (2) - No subtitle, No text.',
          image: {
            url: `${ PUBLIC_URL }assets/surface2.jpg`,
            alt: 'Microsoft Surface Alt',
            tap: {
              type: 'call',
              title: 'Call back!',
              value: '1234567890'
            }
          },
          price: '$XXX'
        }, {
          title: 'Surface Pro 4 (3) - No subtitle, No text, No image',
          price: '$XXX'
        }],
        facts: [{
          key: 'Order Number',
          value: 'Value 1'
        }, {
          key: 'Expected Delivery Time',
          value: 'Value 2'
        }, {
          key: 'Payment Method',
          value: 'Value 3'
        }, {
          key: 'Delivery Address',
          value: 'Value 4'
        }],
        total: '0.01',
        tax: 'XXX.XX',
        buttons: [{
          type: 'imBack',
          title: 'imBack Button',
          value: 'imBack Action'
        }, {
          type: 'postBack',
          title: 'postBack Button',
          value: 'postBack Action'
        }],
        tap: {
          type: 'openUrl',
          title: 'Tapped it!',
          value: `${ PUBLIC_URL }testurl2.html`
        }
      }
    }]
  });
}
