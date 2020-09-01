import blobToArrayBuffer from './blobToArrayBuffer';
import memoizeOne from 'memoize-one';
import workerFunction from './downscaleImageToDataURLUsingWorker.worker';

function createWorker(fn) {
  const blob = new Blob([`(${fn})()`], { type: 'text/javascript' });
  const url = window.URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const worker = new Worker(url);

    worker.onerror = ({ error, message }) => reject(error || new Error(message));
    worker.onmessage = ({ data }) => data === 'ready' && resolve(worker);
  }).finally(() => {
    window.URL.revokeObjectURL(url);
  });
}

let workerPromise;

async function getWorker() {
  let worker;

  if (workerPromise) {
    worker = await workerPromise;
  } else {
    workerPromise = createWorker(workerFunction);

    worker = await workerPromise;
    worker.addEventListener('error', () => {
      // Current worker errored out, will create a new worker next time.
      workerPromise = null;
      worker.terminate();
    });
  }

  return worker;
}

// We are using a lazy-check because:
// 1. OffscreenCanvas.getContext has a toll
// 2. Developers could bring polyfills

const checkSupportOffscreenCanvas = () => {
  const hasOffscreenCanvas =
    typeof window.OffscreenCanvas !== 'undefined' &&
    (typeof window.OffscreenCanvas.prototype.convertToBlob !== 'undefined' ||
      typeof window.OffscreenCanvas.prototype.toBlob !== 'undefined');
  let isOffscreenCanvasSupportGetContext2D;

  if (hasOffscreenCanvas) {
    try {
      new OffscreenCanvas(1, 1).getContext('2d');
      isOffscreenCanvasSupportGetContext2D = true;
    } catch (err) {
      isOffscreenCanvasSupportGetContext2D = false;
    }
  }

  return typeof window.createImageBitmap !== 'undefined' && hasOffscreenCanvas && isOffscreenCanvasSupportGetContext2D;
};

const checkSupportWebWorker = memoizeOne(async () => {
  if (typeof window.MessageChannel === 'undefined' || typeof window.Worker === 'undefined') {
    return false;
  }

  try {
    await createWorker(() => postMessage('ready'));
  } catch (err) {
    return false;
  }

  return true;
});

const checkSupport = memoizeOne(async () => {
  const results = await Promise.all([checkSupportOffscreenCanvas(), checkSupportWebWorker()]);

  return results.every(result => result);
});

export default function downscaleImageToDataURLUsingWorker(blob, maxWidth, maxHeight, type, quality) {
  return new Promise((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();

    port1.onmessage = ({ data: { error, result } }) => {
      if (error) {
        const err = new Error(error.message);

        err.stack = error.stack;

        reject(err);
      } else {
        resolve(result);
      }

      port1.close();
      port2.close();
    };

    Promise.all([blobToArrayBuffer(blob), getWorker()]).then(([arrayBuffer, worker]) =>
      worker.postMessage({ arrayBuffer, maxHeight, maxWidth, quality, type }, [arrayBuffer, port2])
    );
  });
}

export { checkSupport };
