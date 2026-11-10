import { parse } from 'valibot';
import { blankNodeIdentifierSchema } from '../node/BlankNodeIdentifier.ts';
import type { Node } from '../node/Node.ts';
import Store, { type StoreController } from '../Store.ts';

type ActPostActivityResult = {
  resolveAll(): void;
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

  actPostActivity(activity: {
    channelData?: { clientActivityID?: string | undefined } | undefined;
    text?: string | undefined;
  }): Promise<ActPostActivityResult> {
    const nodeId = parse(blankNodeIdentifierSchema, `_:${crypto.randomUUID()}`);
    const clientActivityId = activity.channelData?.clientActivityID ?? crypto.randomUUID();

    this.#controller.edit(transaction => {
      transaction.upsert(
        `_:${clientActivityId}`,
        () =>
          ({
            '@id': nodeId,
            '@type': new Set(['Message', `urn:microsoft:webchat:direct-line-activity`]),
            creativeWorkStatus: ['Draft'],
            text: [activity.text],
            'https://botframework.com/': [
              {
                '@type': 'json',
                '@value': activity
              }
            ]
          }) satisfies Node
      );
    });

    return Promise.resolve({
      resolveAll: () => {
        this.#controller.edit(transaction => {
          transaction.upsert(nodeId, message => {
            if (!message) {
              throw new Error(`Message node "${nodeId}" is already deleted before resolveAll() could publish it`);
            }

            return {
              ...message,
              creativeWorkStatus: ['Published']
            };
          });
        });
      }
    });
  }
}

export default DirectLineJSEmulatorStore;
