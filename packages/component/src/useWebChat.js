// TODO: Should take this one out

// import { createSelectorHook, createStoreHook } from 'react-redux';
// import { useContext, useLayoutEffect, useEffect, useReducer, useRef } from 'react';

// import WebChatReduxContext from './WebChatReduxContext';
// import WebChatContext from './Context';

// const useStore = createStoreHook(WebChatReduxContext);

// const useIsomorphicLayoutEffect =
//   typeof window !== 'undefined' ? useLayoutEffect : useEffect

// export default function useWebChat(selector) {
//   const [, forceRender] = useReducer(s => s + 1, 0);
//   const context = useContext(WebChatContext);
//   const store = useStore();
//   const lastSelector = useRef();
//   const lastResult = useRef();

//   let result;

//   if (selector !== lastSelector.current) {
//     result = selector({ ...store.getState(), ...context });
//   } else {
//     result = lastResult.current;
//   }

//   useIsomorphicLayoutEffect(() => {
//     lastSelector.current = selector;
//     lastResult.current = result;
//   });

//   useIsomorphicLayoutEffect(() => {
//     const unsubscribe = store.subscribe(() => {
//       const state = store.getState();
//       const currentResult = lastSelector.current({ ...state, ...context });

//       if (!Object.is(lastResult.current, currentResult)) {
//         lastResult.current = currentResult;
//         forceRender({});
//       }
//     });

//     return () => {
//       console.log('unsubscribe');
//       unsubscribe();
//     };
//   }, [context, store]);

//   return result;
// }
