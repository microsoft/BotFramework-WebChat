import { activityComponent, createActivityPolymiddleware } from 'botframework-webchat/middleware';
import { is, safeParse } from 'valibot';
import MCPAppActivity from './MCPAppActivity.js';
import { MessageEntityForMCPAppSchema, type MessageEntityForMCPApp } from './types/MessageEntityForMCPApp.js';

export default function createPolymiddleware() {
  return Object.freeze([
    createActivityPolymiddleware(next => request => {
      const {
        activity: { entities }
      } = request;

      const messageEntity: MessageEntityForMCPApp | undefined = (
        entities as any[] | undefined
      )?.find<MessageEntityForMCPApp>(entity => is(MessageEntityForMCPAppSchema, entity));

      // if (!messageEntity && entities) {
      //   for (const entity of entities) {
      //     // eslint-disable-next-line no-console
      //     console.log(safeParse(MessageEntityForMCPAppSchema, entity));
      //   }

      //   return;
      // }

      if (messageEntity?.additionalType?.includes('WebPage')) {
        return activityComponent(MCPAppActivity, { entity: messageEntity });
      }

      return next(request);
    })
  ]);
}
