import type { MachineAction } from '../machines/types';

// As `miniKindOf()` of Redux, for the common kinds: dates, errors, maps and the like are "object" here.
function kindOf(value: unknown): string {
  return value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  let proto = value;

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(value) === proto || Object.getPrototypeOf(value) === null;
}

/**
 * The checks of `dispatch()` of a Redux store (Redux 5.0.1, with its messages of development builds), for the actions
 * that a host dispatches without a store (e.g. card action middleware): throws if it is not an action.
 */
export default function validateAction(action: unknown): asserts action is MachineAction {
  if (!isPlainObject(action)) {
    throw new Error(
      `Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`
    );
  }

  if (typeof action.type === 'undefined') {
    throw new Error(
      'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.'
    );
  }

  if (typeof action.type !== 'string') {
    throw new Error(
      `Action "type" property must be a string. Instead, the actual type was: '${kindOf(action.type)}'. Value was: '${String(action.type)}' (stringified)`
    );
  }
}
