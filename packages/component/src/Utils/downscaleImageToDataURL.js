const WORKER_FN = `
'use strict';

onmessage = async ({ data: { arrayBuffer, maxHeight, maxWidth, type, quality }, ports: [port] }) => {
  try {
    const imageBitmap = await createImageBitmap(new Blob([arrayBuffer], { resizeQuality: 'high' }));
    const { height, width } = keepAspectRatio(imageBitmap.width, imageBitmap.height, maxWidth, maxHeight);
    const offscreenCanvas = new OffscreenCanvas(width, height);
    const context = offscreenCanvas.getContext('2d');

    context.drawImage(imageBitmap, 0, 0, width, height);

    const blob = await offscreenCanvas.convertToBlob({ type, quality });

    port.postMessage({ result: await blobToDataURL(blob) });
  } catch ({ message }) {
    port.postMessage({ error: message });
  }
};

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = ({ error, message }) => reject(error || new Error(message));
    reader.onloadend = () => resolve(reader.result);

    reader.readAsDataURL(blob);
  });
}

function keepAspectRatio(width, height, maxWidth, maxHeight) {
  if (width < maxWidth && height < maxHeight) {
    // Photo is smaller than both maximum dimensions, take it as-is

    return { height, width };
  }

  const aspectRatio = width / height;

  if (aspectRatio > maxWidth / maxHeight) {
    // Photo is wider than maximum dimension, downscale it based on maxWidth.

    return {
      height: maxWidth / aspectRatio,
      width: maxWidth
    };
  } else {
    // Photo is taller than maximum dimension, downscale it based on maxHeight.

    return {
      height: maxHeight,
      width: maxHeight * aspectRatio
    };
  }
}

postMessage('ready');
`;

function createWorker() {
  const blob = new Blob([WORKER_FN], { type: 'text/javascript' });
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
