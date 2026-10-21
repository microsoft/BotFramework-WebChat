/**
 * Gets the color the browser renders at the center of the element, from a screenshot via Chrome DevTools Protocol.
 *
 * Unlike reading pixels back from a canvas, it shows the current frame of an animated image, and works with images from other origins.
 *
 * @param {Element} element - The element to look up.
 * @returns {Promise<string>} The color as a lowercase hex string, e.g. `#c50f1f`.
 */
export default async function getRenderedColor(element) {
  if (!(element instanceof Element)) {
    throw new Error('getRenderedColor: "element" must be an instance of Element.');
  }

  const { height, left, top, width } = element.getBoundingClientRect();

  // The clip is in document coordinates.
  const { data } = await host.sendAndGetDevToolsCommand('Page.captureScreenshot', {
    clip: {
      height: 1,
      scale: 1,
      width: 1,
      x: Math.floor(scrollX + left + width / 2),
      y: Math.floor(scrollY + top + height / 2)
    },
    format: 'png'
  });

  const bitmap = await createImageBitmap(
    new Blob([Uint8Array.from(atob(data), character => character.charCodeAt(0))], { type: 'image/png' })
  );

  const context = new OffscreenCanvas(1, 1).getContext('2d');

  context.drawImage(bitmap, 0, 0);

  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;

  return `#${[red, green, blue].map(value => value.toString(16).padStart(2, '0')).join('')}`;
}
