import became from './became';

export default function allImagesLoaded() {
  return became(
    'all images loaded',
    () => [].every.call(document.querySelectorAll('img'), ({ complete }) => complete),
    15000
  );
}
