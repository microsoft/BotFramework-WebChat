export default function createMonochromeImageMaskerStyleSet() {
  return {
    '&.webchat__monochrome-image-masker': {
      backgroundColor: '#707070',
      maskImage: 'var(--webchat__monochrome-image-masker__mask-image)',
      maskRepeat: 'no-repeat',
      WebkitMaskImage: 'var(--webchat__monochrome-image-masker__mask-image)',
      WebkitMaskRepeat: 'no-repeat'
    }
  };
}
