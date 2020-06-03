export default function allImagesLoaded() {
  return {
    message: 'all images to be loaded',
    fn: () => [].every.call(document.querySelectorAll('img'), ({ complete }) => complete)
  };
}
