// HACK: Before we bump to jest@29, the performance object is marked as readonly in Node.js 20 and some latter versions of Node.js 18.
//       Similar to https://github.com/facebook/react-native/issues/35701.
global.performance = { ...global.performance };
