import became from './became';

export default function allImagesLoaded() {
  return became(
    'all images to be loaded',
    () => [].every.call(document.querySelectorAll('img'), ({ complete }) => complete),
    15000
  );
}
