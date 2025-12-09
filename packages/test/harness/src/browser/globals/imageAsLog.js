function getBlobURL(base64) {
  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let index = 0; index < byteString.length; index++) {
    uint8Array[+index] = byteString.charCodeAt(index);
  }

  const blob = new Blob([uint8Array], { type: 'image/png' });

  return URL.createObjectURL(blob);
}

function getImageSize(url) {
  return new Promise((resolve, reject) => {
    const imageElement = document.createElement('img');

    imageElement.onerror = ({ error }) => reject(error);
    imageElement.onload = () => resolve({ height: imageElement.naturalHeight, width: imageElement.naturalWidth });

    imageElement.setAttribute('src', url);
  });
}

async function imageAsLog(base64, scale = 1) {
  const url = getBlobURL(base64);
  const { height, width } = await getImageSize(url);

  const scaledHeight = height * scale;
  const scaledWidth = width * scale;

  return [
    `${width} × ${height}\n${url}\n%cM`,
    `background-image: url(data:image/png;base64,${base64}); background-repeat: no-repeat; background-size: ${scaledWidth}px ${scaledHeight}px; color: Transparent; font-size: 1px; padding: ${
      scaledHeight >> 1
    }px; ${scaledWidth >> 1}px;`
  ];
}

export default function () {
  return window.imageAsLog || (window.imageAsLog = imageAsLog);
}
