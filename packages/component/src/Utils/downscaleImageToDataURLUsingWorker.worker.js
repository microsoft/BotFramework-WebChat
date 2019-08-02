/* eslint object-shorthand: "off" */
/* eslint prefer-destructuring: "off" */
/* eslint prefer-arrow-callback: "off" */

// This file is the entrypoint of Web Worker and is minimally transpiled through Babel.
// Do not include any dependencies here because they will not be bundled.

// This file will also get loaded by IE11, please make sure you hand-transpile it correctly.

export default function() {
  function blobToDataURL(blob) {
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();

      reader.onerror = function(event) {
        reject(event.error || new Error(event.message));
      };

      reader.onloadend = function() {
        resolve(reader.result);
      };

      reader.readAsDataURL(blob);
    });
  }

  function keepAspectRatio(width, height, maxWidth, maxHeight) {
    if (width < maxWidth && height < maxHeight) {
      // Photo is smaller than both maximum dimensions, take it as-is
      return {
        height: height,
        width: width
      };
    }

    const aspectRatio = width / height;

    if (aspectRatio > maxWidth / maxHeight) {
      // Photo is wider than maximum dimension, downscale it based on maxWidth.
      return {
        height: maxWidth / aspectRatio,
        width: maxWidth
      };
    }

    // Photo is taller than maximum dimension, downscale it based on maxHeight.
    return {
      height: maxHeight,
      width: maxHeight * aspectRatio
    };
  }

  onmessage = function(event) {
    const data = event.data;
    const arrayBuffer = data.arrayBuffer;
    const maxHeight = data.maxHeight;
    const maxWidth = data.maxWidth;
    const type = data.type;
    const quality = data.quality;
    const port = event.ports[0];

    return Promise.resolve()
      .then(function() {
        return createImageBitmap(new Blob([arrayBuffer], { resizeQuality: 'high' }));
      })
      .then(function(imageBitmap) {
        const dimension = keepAspectRatio(imageBitmap.width, imageBitmap.height, maxWidth, maxHeight);
        const height = dimension.height;
        const width = dimension.width;
        const offscreenCanvas = new OffscreenCanvas(width, height);
        const context = offscreenCanvas.getContext('2d');

        context.drawImage(imageBitmap, 0, 0, width, height);

        // Firefox quirks: 68.0.1 call named OffscreenCanvas.convertToBlob as OffscreenCanvas.toBlob.
        const convertToBlob = (offscreenCanvas.convertToBlob || offscreenCanvas.toBlob).bind(offscreenCanvas);

        return convertToBlob({ type: type, quality: quality });
      })
      .then(function(blob) {
        return blobToDataURL(blob);
      })
      .then(function(dataURL) {
        return port.postMessage({ result: dataURL });
      })
      .catch(function(err) {
        console.error(err);

        port.postMessage({
          error: {
            message: err.message,
            stack: err.stack
          }
        });
      });
  };

  postMessage('ready');
}
