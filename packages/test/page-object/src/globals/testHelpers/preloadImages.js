// Keep the images referenced, so the browser keeps them in its list of available images until they are rendered.
const preloadedImages = new Set();

/**
 * Loads and decodes images before they are rendered.
 *
 * If an image is not available when its element is first painted, the browser repaints the area of the image later.
 * Anti-aliased edges in that area (e.g. rounded corners and outlines) may come out slightly different from a full paint,
 * and the screenshot may differ by a few pixels.
 *
 * @param {...string} urls - URLs of the images.
 * @returns {Promise<void>}
 */
export default async function preloadImages(...urls) {
  await Promise.all(
    urls.map(url => {
      const image = new Image();

      image.src = url;
      preloadedImages.add(image);

      return image.decode();
    })
  );
}
