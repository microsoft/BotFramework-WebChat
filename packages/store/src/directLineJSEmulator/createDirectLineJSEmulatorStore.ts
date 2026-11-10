import { parse } from 'valibot';
import { blankNodeIdentifierSchema } from '../node/BlankNodeIdentifier.ts';
import Store, { type StoreController } from '../Store.ts';
import type { JSONLiteral } from '../node/JSONLiteral.ts';

type ActPostActivityResult = {
  resolveAll(): void;
};

type Activity = {
  channelData?: { clientActivityID?: string | undefined } | undefined;
  localTimestamp?: string | undefined;
  id?: string | undefined;
  text?: string | undefined;
  type: string;
};

class DirectLineJSEmulatorStore extends Store {
  constructor() {
    super({
      start: controller => {
        this.#controller = controller;
      }
    });

    // @ts-expect-error #controller should be assigned by now.
    if (this.#controller) {
      throw new Error('StoreController has not wired up yet');
    }

    // Hacking TypeScript, we should have #controller assigned.
    this.#controller = undefined as unknown as StoreController;
  }

  #controller: StoreController;

  actPostActivity(activity: (Activity & { id?: never }) | string): Promise<ActPostActivityResult> {
    if (typeof activity === 'string') {
      activity = {
        text: activity,
        type: 'message'
      };
    }

    activity.localTimestamp ??= new Date().toISOString();

    const nodeId = parse(blankNodeIdentifierSchema, `_:${crypto.randomUUID()}`);
    const clientActivityId = activity.channelData?.clientActivityID ?? crypto.randomUUID();
    const serverActivityId = activity.id ?? crypto.randomUUID();

    this.#controller.edit(transaction => {
      transaction.upsert(`_:${clientActivityId}`, () => ({
        '@id': nodeId,
        '@type': new Set(['Message', `urn:microsoft:webchat:direct-line-activity`]),
        creativeWorkStatus: ['Draft'],
        text: activity.text ? [activity.text] : [],
        'urn:microsoft:webchat:direct-line-activity:raw-json': [{ '@type': '@json', '@value': activity }],
        'urn:microsoft:webchat:direct-line-activity:type': ['message']
      }));
    });

    return Promise.resolve({
      resolveAll: () => {
        this.#controller.edit(transaction => {
          transaction.upsert(nodeId, message => {
            if (!message) {
              throw new Error(`Message node "${nodeId}" is already deleted before resolveAll() could publish it`);
            }

            const dateCreated = new Date().toISOString();

            const activity = (
              message['urn:microsoft:webchat:direct-line-activity:raw-json'] as JSONLiteral | undefined
            )?.['@value'] as Activity;

            return {
              ...message,
              creativeWorkStatus: ['Published'],
              dateCreated,
              'urn:microsoft:webchat:direct-line-activity:raw-json': [
                {
                  '@type': '@json',
                  '@value': {
                    ...activity,
                    id: serverActivityId,
                    timestamp: dateCreated
                  }
                }
              ]
            };
          });
        });
      }
    });
  }
}

export default DirectLineJSEmulatorStore;
