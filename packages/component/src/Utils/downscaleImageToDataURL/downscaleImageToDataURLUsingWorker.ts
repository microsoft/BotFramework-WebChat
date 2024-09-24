import workerFunction from './downscaleImageToDataURLUsingWorker.worker';
import { type WorkerJob, type WorkerReturnValue } from './WorkerJob';

function createWorker(fn: Function | string): Promise<Worker> {
  const blob = new Blob([`(${fn})()`], { type: 'text/javascript' });
  const url = window.URL.createObjectURL(blob);

  return new Promise<Worker>((resolve, reject) => {
    const worker = new Worker(url);

    worker.onerror = ({ error, message }) => reject(error || new Error(message));
    worker.onmessage = ({ data }) => data === 'ready' && resolve(worker);
  }).finally(() => {
    window.URL.revokeObjectURL(url);
  });
}

let workerPromise;

async function getWorker(): Promise<Worker> {
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
      // Firefox quirks: 68.0.1 call named OffscreenCanvas.convertToBlob as OffscreenCanvas.toBlob.
      typeof (window.OffscreenCanvas.prototype as any).toBlob !== 'undefined');
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

let checkSupportWebWorkerPromise;

function checkSupportWebWorker(): Promise<boolean> {
  return (
    checkSupportWebWorkerPromise ||
    (checkSupportWebWorkerPromise = (async () => {
      if (typeof window.MessageChannel === 'undefined' || typeof window.Worker === 'undefined') {
        return false;
      }

      let worker;

      try {
        worker = await createWorker('function(){postMessage("ready")}');
      } catch (err) {
        return false;
      }

      worker.terminate();

      return true;
    })())
  );
}

let checkSupportPromise: Promise<boolean>;

function checkSupport(): Promise<boolean> {
  return (
    checkSupportPromise ||
    (checkSupportPromise = (async () => {
      try {
        const results = await Promise.all([checkSupportOffscreenCanvas(), checkSupportWebWorker()]);

        return results.every(result => result);
      } catch (err) {
        return false;
      }
    })())
  );
}

export default function downscaleImageToDataURLUsingWorker(
  blob: Blob | File,
  maxWidth: number,
  maxHeight: number,
  type: string,
  quality: number
): Promise<URL> {
  return new Promise<URL>((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();

    port1.onmessage = ({ data }: MessageEvent<WorkerReturnValue>) => {
      if ('error' in data) {
        const { message, stack } = data.error;

        const err = new Error(message);

        err.stack = stack;

        reject(err);
      } else {
        resolve(new URL(data.result));
      }

      port1.close();
      port2.close();
    };

    Promise.all([blob.arrayBuffer(), getWorker()]).then(([arrayBuffer, worker]) =>
      worker.postMessage({ arrayBuffer, maxHeight, maxWidth, quality, type } as WorkerJob, [arrayBuffer, port2])
    );
  });
}

export { checkSupport };
