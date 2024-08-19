export default function createMonochromeImageMaskerStyleSet() {
  return {
    '&.webchat__monochrome-image-masker': {
      backgroundColor: '#707070',
      maskImage: 'var(--webchat__monochrome-image-masker__mask-image)',
      maskRepeat: 'no-repeat',
      '-webkit-mask-image': 'var(--webchat__monochrome-image-masker__mask-image)',
      '-webkit-mask-repeat': 'no-repeat'
    }
  };
}
