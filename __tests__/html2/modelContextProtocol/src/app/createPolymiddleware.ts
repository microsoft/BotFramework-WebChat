import { activityComponent, createActivityPolymiddleware } from 'botframework-webchat/middleware';
import { is } from 'valibot';
import MCPAppActivity from './MCPAppActivity.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { MCPAppsResponseEntitySchema, type MCPAppsResponseEntity } from './types.js';

export default function createPolymiddleware({ transport }: { transport?: Transport } = {}) {
  return Object.freeze([
    createActivityPolymiddleware(next => request => {
      const {
        activity: { entities }
      } = request;

      const messageEntity: MCPAppsResponseEntity | undefined = (
        entities as any[] | undefined
      )?.find<MCPAppsResponseEntity>(entity => is(MCPAppsResponseEntitySchema, entity));

      if (messageEntity?.additionalType?.includes('WebPage')) {
        return activityComponent(MCPAppActivity, { entity: messageEntity, transport });
      }

      return next(request);
    })
  ]);
}
