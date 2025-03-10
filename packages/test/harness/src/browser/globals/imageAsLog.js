async function getBlobURL(base64) {
  const res = await fetch(`data:image/png;base64,${base64}`);
  const blob = await res.blob();

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
  const url = await getBlobURL(base64);
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
