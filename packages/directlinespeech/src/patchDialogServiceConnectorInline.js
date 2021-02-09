import createDeferred from 'p-defer-es5';

// Patching a function to add pre-processing of arguments and post-processing of result.
function patchFunction(fn, pre, post) {
  return (...args) => {
    args = pre ? pre(...args) : args;

    const result = fn(...args);

    return post ? post(result) : result;
  };
}

export default function patchDialogServiceConnectorInline(dialogServiceConnector) {
  // This function will patch DialogServiceConnector by modifying the object.
  // The patches are intended to fill-in features to make DialogServiceConnector object works like the full-fledged Recognizer object.

  let lastRecognitionDeferred;

  dialogServiceConnector.listenOnceAsync = patchFunction(
    dialogServiceConnector.listenOnceAsync.bind(dialogServiceConnector),
    (resolve, reject, ...args) => {
      lastRecognitionDeferred = createDeferred();

      return [
        patchFunction(resolve, null, result => {
          lastRecognitionDeferred.resolve(result);

          return result;
        }),
        patchFunction(reject, null, error => {
          lastRecognitionDeferred.reject(error);

          return error;
        }),
        ...args
      ];
    }
  );

  // TODO: [P1] #2664 startContinuousRecognitionAsync is not working yet in Speech SDK 1.15.0.
  //       We need to polyfill to use listenOnceAsync instead, and disable stopContinuousRecognitionAsync.
  dialogServiceConnector.startContinuousRecognitionAsync = (resolve, reject) => {
    dialogServiceConnector.listenOnceAsync(
      () => {
        // We will resolve the Promise in a setTimeout.
      },
      err => {
        resolve = null;
        reject && reject(err);
      }
    );

    setTimeout(() => {
      reject = null;
      resolve && resolve();
    }, 0);
  };

  // TODO: stopContinuousRecognitionAsync is not working yet.
  //       We will leave out the implementation as falsy, Web Chat will disable the microphone button after start dictate.
  //       This will prevent user from aborting speech recognition.
  // dialogServiceConnector.stopContinuousRecognitionAsync = resolve => {
  // };

  return dialogServiceConnector;
}
