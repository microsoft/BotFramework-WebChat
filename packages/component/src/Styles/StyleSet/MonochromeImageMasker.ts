export default function createMonochromeImageMaskerStyleSet() {
  return {
    '&.webchat__monochrome-image-masker': {
      backgroundColor: '#707070',
      maskImage: 'var(--monochrome-image-masker__mask-image, var(--webchat__monochrome-image-masker__mask-image))',
      maskRepeat: 'no-repeat',
      maskSize: 'contain',
      WebkitMaskImage:
        'var(--monochrome-image-masker__mask-image, var(--webchat__monochrome-image-masker__mask-image))',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
      WebkitMaskSize: 'contain'
    }
  };
}
