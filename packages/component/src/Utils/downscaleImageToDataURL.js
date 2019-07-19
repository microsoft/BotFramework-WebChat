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

      try {
        worker.terminate();
      } catch (err) {}
    });
  }

  return worker;
}

export default async function downscaleImageToDataURL(
  arrayBuffer,
  maxWidth = 480,
  maxHeight = 240,
  type = 'image/jpeg',
  quality = 0.6
) {
  return new Promise(async (resolve, reject) => {
    const { port1, port2 } = new MessageChannel();

    port1.onmessage = ({ data: { error, result } }) => {
      port1.close();
      port2.close();
      error ? reject(error) : resolve(result);
    };

    const worker = await getWorker();

    worker.postMessage({ arrayBuffer, maxHeight, maxWidth, quality, type }, [arrayBuffer, port2]);
  });
}
