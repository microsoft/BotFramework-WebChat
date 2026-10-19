import { FORCED_COLORS_SELECTOR } from './Constants';

export default function AudioContent() {
  return {
    width: '100%',

    // Chromium picks the player icons by the color scheme of the element, not by the forced colors palette, so dark palettes (e.g. "Aquatic" on Windows) get dark icons.
    // TODO: Remove when Chromium is fixed, https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/modules/media_controls/resources/mediaControls.css.
    [FORCED_COLORS_SELECTOR]: {
      colorScheme: 'light dark'
    }
  };
}
