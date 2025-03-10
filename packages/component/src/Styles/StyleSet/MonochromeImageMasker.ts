export default function createMonochromeImageMaskerStyleSet() {
  return {
    '&.webchat__monochrome-image-masker': {
      backgroundColor: '#707070',
      mask: 'var(--monochrome-image-masker__mask-image, var(--webchat__monochrome-image-masker__mask-image)) no-repeat 100% / 100%',
      WebkitMask:
        'var(--monochrome-image-masker__mask-image, var(--webchat__monochrome-image-masker__mask-image)) no-repeat 100% / 100%'
    }
  };
}
