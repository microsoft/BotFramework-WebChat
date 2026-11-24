import { isPlainObject, type Action } from 'redux';

import kindOf from './kindOf';

/**
 * The checks of `dispatch()` of a Redux store, with the messages of the development build of Redux 5.0.1: throws if
 * `action` is not an action.
 */
export default function validateAction(action: unknown): asserts action is Action {
  // Redux's own helper, until the engine replaces the Redux store and `redux` goes.
  if (!isPlainObject(action)) {
    throw new Error(
      `Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`
    );
  }

  const { type } = action as { readonly type?: unknown };

  if (typeof type === 'undefined') {
    throw new Error(
      'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.'
    );
  }

  if (typeof type !== 'string') {
    // As Redux, a symbol throws a TypeError here: it cannot be converted to a string.
    throw new Error(
      `Action "type" property must be a string. Instead, the actual type was: '${kindOf(type)}'. Value was: '${type}' (stringified)`
    );
  }
}
