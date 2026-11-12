import { isForbiddenPropertyName } from '@msinternal/botframework-webchat-base/utils';

type SliceReducer = (state: any, action: any) => any;

type StateOfSlices<M extends Readonly<Record<string, SliceReducer>>> = {
  readonly [K in keyof M]: ReturnType<M[K]>;
};

/**
 * `combineReducers()` of Redux for the reducer groups of default mode: each key of the state is reduced by the reducer
 * of the same key, and the state keeps its identity when no slice changed.
 *
 * As Redux, a slice reducer that returns `undefined` throws to the dispatcher with the same message (e.g.
 * `setDictateInterims(undefined)`), and the state stays as it was.
 */
export default function combineSliceReducers<M extends Readonly<Record<string, SliceReducer>>>(
  reducers: M
): (state: StateOfSlices<M> | undefined, action: { readonly type: string }) => StateOfSlices<M> {
  const entries = Object.entries(reducers).filter(([key]) => !isForbiddenPropertyName(key));

  return (state, action) => {
    let hasChanged = !state;
    const nextState: Record<string, unknown> = {};

    for (const [key, reducer] of entries) {
      // `key` is not a forbidden property name.
      // eslint-disable-next-line security/detect-object-injection
      const previousSliceState = state?.[key];
      const nextSliceState = reducer(previousSliceState, action);

      if (typeof nextSliceState === 'undefined') {
        const { type } = action;

        throw new Error(
          `When called with an action of type ${type ? `"${String(type)}"` : '(unknown type)'}, the slice reducer for key "${key}" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.`
        );
      }

      // eslint-disable-next-line security/detect-object-injection
      nextState[key] = nextSliceState;
      hasChanged ||= !Object.is(nextSliceState, previousSliceState);
    }

    return hasChanged ? (Object.freeze(nextState) as StateOfSlices<M>) : state;
  };
}

export type { SliceReducer, StateOfSlices };
