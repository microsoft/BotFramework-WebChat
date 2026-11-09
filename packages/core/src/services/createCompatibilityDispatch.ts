import type { OutgoingService } from './createOutgoingService';

declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

type CompatibilityDispatch = (action: unknown) => unknown;

const SEND_TYPES = Object.freeze([
  'WEB_CHAT/SEND_MESSAGE',
  'WEB_CHAT/SEND_MESSAGE_BACK',
  'WEB_CHAT/SEND_POST_BACK',
  'WEB_CHAT/SEND_EVENT',
  'WEB_CHAT/SEND_FILES',
  'DIRECT_LINE/POST_ACTIVITY'
]);

function isPlainObject(value: unknown): value is Record<string, any> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === null || Object.getPrototypeOf(prototype) === null;
}

function kindOf(value: unknown): string {
  return value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
}

/**
 * The `dispatch()` given to card action middleware by the default providers of the api, which have no Redux store: the
 * actions that send activities do what they do in Redux mode, with the outgoing service. Their payloads are read as the
 * sagas read them, without validation, so raw actions work as before. Any other action does nothing: a warning, once
 * per type, in development.
 *
 * As `store.dispatch()`, it returns the action, and throws on what is not an action.
 */
export default function createCompatibilityDispatch({
  outgoing
}: {
  readonly outgoing: Pick<
    OutgoingService,
    'postActivity' | 'sendEvent' | 'sendFiles' | 'sendMessage' | 'sendMessageBack' | 'sendPostBack' | 'whileOnline'
  >;
}): CompatibilityDispatch {
  const warned = new Set<string>();

  return action => {
    // The errors of Redux.
    if (!isPlainObject(action)) {
      throw new Error(
        `Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions.`
      );
    } else if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.'
      );
    }

    // As the sagas, only while online; an error (e.g. a payload that cannot be sent) stops everything.
    switch (action.type) {
      case 'WEB_CHAT/SEND_MESSAGE':
        outgoing.whileOnline(() => outgoing.sendMessage(action.payload));
        break;

      case 'WEB_CHAT/SEND_MESSAGE_BACK':
        outgoing.whileOnline(() => outgoing.sendMessageBack(action.payload));
        break;

      case 'WEB_CHAT/SEND_POST_BACK':
        outgoing.whileOnline(() => outgoing.sendPostBack(action.payload));
        break;

      case 'WEB_CHAT/SEND_EVENT':
        outgoing.whileOnline(() => outgoing.sendEvent(action.payload));
        break;

      case 'WEB_CHAT/SEND_FILES':
        outgoing.whileOnline(() => outgoing.sendFiles(action.payload));
        break;

      case 'DIRECT_LINE/POST_ACTIVITY':
        outgoing.whileOnline(() => outgoing.postActivity(action.payload.activity, action.meta.method));
        break;

      default: {
        const type = String(action.type);

        if (process.env.NODE_ENV !== 'production' && !warned.has(type)) {
          warned.add(type);

          console.warn(
            `botframework-webchat: Without a Redux store, dispatch() of card action middleware only sends activities (${SEND_TYPES.join(', ')}). Ignored: "${type}". Pass a "store" to use other actions.`
          );
        }
      }
    }

    return action;
  };
}

export { type CompatibilityDispatch };
