// This file is for Web Worker and is minimally transpiled thru Babel.

export default () => {
  onmessage = async ({ data: { arrayBuffer, maxHeight, maxWidth, type, quality }, ports: [port] }) => {
    try {
      const imageBitmap = await createImageBitmap(
        new Blob([arrayBuffer], {
          resizeQuality: 'high'
        })
      );

      const { height, width } = keepAspectRatio(imageBitmap.width, imageBitmap.height, maxWidth, maxHeight);

      const offscreenCanvas = new OffscreenCanvas(width, height);
      const context = offscreenCanvas.getContext('2d');

      context.drawImage(imageBitmap, 0, 0, width, height);

      const blob = await offscreenCanvas.convertToBlob({
        type,
        quality
      });

      port.postMessage({
        result: await blobToDataURL(blob)
      });
    } catch ({ message }) {
      port.postMessage({
        error: message
      });
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
      return {
        height,
        width
      };
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
};
