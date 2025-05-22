import { type StyleSet } from '../Styles/StyleSet/types/StyleSet';

export default function createModdableIconStyle() {
  return {
    '&.webchat__moddable-icon': {
      height: '100%',
      width: '100%',

      // 1. Use the image as texture.
      backgroundImage: 'var(--webchat__moddable-icon--image, none)',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'var(--webchat__moddable-icon--size, 1em)',

      // 2. If image is not set, fallback to solid color.
      backgroundColor: 'var(--webchat__moddable-icon--color, transparent)',

      // 3. Set the mask if any.
      maskImage: 'var(--webchat__moddable-icon--mask)', // TODO: Need to think about 3P customization story.
      maskPosition: 'center',
      maskRepeat: 'no-repeat',
      maskSize: 'var(--webchat__moddable-icon--size, 1em)'
    }
  } satisfies StyleSet;
}
