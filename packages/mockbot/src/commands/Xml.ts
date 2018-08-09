import { TurnContext } from 'botbuilder';

export default async function (context: TurnContext) {
  await context.sendActivity({
    type: 'message',
    textFormat: 'xml',
    text: '# markdown h1 <h1>xml h1</h1>\r\n *markdown italic* <i>xml italic</i>\r\n **markdown bold** <b>xml bold</b>\r\n ~~markdown strikethrough~~ <s>xml strikethrough</s>'
  });
}
