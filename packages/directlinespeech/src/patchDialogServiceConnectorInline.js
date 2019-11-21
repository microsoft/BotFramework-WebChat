import createDeferred from 'p-defer';

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
        patchFunction(reject, null, result => {
          lastRecognitionDeferred.reject(result);

          return error;
        }),
        ...args
      ];
    }
  );

  // TODO: startContinuousRecognitionAsync is not working yet, use listenOnceAsync instead.
  dialogServiceConnector.startContinuousRecognitionAsync = (resolve, reject) => {
    dialogServiceConnector.listenOnceAsync(
      () => {},
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

  // TODO: stopContinuousRecognitionAsync is not working yet, so we resolve when the recognition completed.
  dialogServiceConnector.stopContinuousRecognitionAsync = resolve => {
    // web-speech-cognitive-services always operate in continuous mode for compatibility reason.
    // When in non-continuous mode, this function will be called after the first recognition.

    // console.groupCollapsed('stopContinuousRecognitionAsync');
    // console.log(dialogServiceConnector);
    // console.groupEnd();

    resolve && lastRecognitionDeferred && lastRecognitionDeferred.promise.then(resolve, resolve);
  };

  return dialogServiceConnector;
}
