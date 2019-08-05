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
  }

  // Photo is taller than maximum dimension, downscale it based on maxHeight.
  return {
    height: maxHeight,
    width: maxHeight * aspectRatio
  };
}

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');

  canvas.height = height;
  canvas.width = width;

  return canvas;
}

function loadImageFromBlob(blob) {
  const blobURL = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const image = document.createElement('img');

    image.addEventListener('error', ({ error }) => reject(error));
    image.addEventListener('load', () => resolve(image));
    image.setAttribute('src', blobURL);
  }).finally(() => {
    URL.revokeObjectURL(blobURL);
  });
}

export default async function downscaleImageToDataURLUsingBrowser(blob, maxWidth, maxHeight, type, quality) {
  const image = await loadImageFromBlob(blob);
  const { height, width } = keepAspectRatio(image.width, image.height, maxWidth, maxHeight);
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL(type, quality);
}
