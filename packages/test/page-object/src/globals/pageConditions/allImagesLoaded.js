import became from './became';
import root from '../pageElements/root';

export default function allImagesLoaded() {
  return became(
    'all images loaded',
    () => [].every.call(root().querySelectorAll('img'), ({ complete }) => complete),
    15000
  );
}
