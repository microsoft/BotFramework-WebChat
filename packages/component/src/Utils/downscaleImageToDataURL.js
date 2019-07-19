import worker from './downscaleImageToDataURL.worker';

function createWorker() {
  const blob = new Blob([`(${worker})()`], { type: 'text/javascript' });
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
    workerPromise = createWorker();

    worker = await workerPromise;
    worker.addEventListener('error', () => {
      // Current worker errored out, will create a new worker next time.
      workerPromise = null;
      worker.terminate();
    });
  }

  return worker;
}

const support =
  typeof window.createImageBitmap !== 'undefined' &&
  typeof window.MessageChannel !== 'undefined' &&
  typeof window.OffscreenCanvas !== 'undefined' &&
  typeof window.OffscreenCanvas.prototype.convertToBlob !== 'undefined' &&
  typeof window.Worker !== 'undefined';

export default function downscaleImageToDataURL(arrayBuffer, maxWidth, maxHeight, type, quality) {
  return new Promise((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();

    port1.onmessage = ({ data: { error, result } }) => {
      error ? reject(error) : resolve(result);
      port1.close();
      port2.close();
    };

    getWorker().then(worker =>
      worker.postMessage({ arrayBuffer, maxHeight, maxWidth, quality, type }, [arrayBuffer, port2])
    );
  });
}

export { support };
