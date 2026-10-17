/* eslint-disable no-magic-numbers */

// WCAG 2.x success criterion 1.4.3 (Contrast, Minimum), for text of normal size.
const MIN_CONTRAST_RATIO = 4.5;

// https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
function getRelativeLuminance(rgb: readonly number[]): number {
  const [red, green, blue] = rgb.map(channel => {
    const value = channel / 255;

    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

// https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
function getContrastRatio(rgb1: readonly number[], rgb2: readonly number[]): number {
  const [lighter, darker] = [getRelativeLuminance(rgb1), getRelativeLuminance(rgb2)].sort((x, y) => y - x);

  return (lighter + 0.05) / (darker + 0.05);
}

function parseHexColor(color: string): readonly number[] | undefined {
  return /^#[\da-f]{6}$/iu.test(color)
    ? [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16))
    : undefined;
}

/**
 * Returns the color unchanged if it has a contrast ratio of at least 4.5:1 against the background.
 *
 * Otherwise, returns the first mix of the color with black (`'darken'`) or white (`'lighten'`), in 1% steps,
 * that reaches 4.5:1. Mixing with black or white keeps the hue of the color.
 *
 * Only `#rrggbb` colors are supported, other colors are returned unchanged.
 */
export default function ensureContrast(color: string, background: string, direction: 'darken' | 'lighten'): string {
  const backgroundRGB = parseHexColor(background);
  const rgb = parseHexColor(color);

  if (!backgroundRGB || !rgb) {
    return color;
  }

  const target = direction === 'darken' ? 0 : 255;

  // From the color itself (0%) to black or white (100%).
  const mixes = Array.from({ length: 101 }, (_, percentage) =>
    rgb.map(channel => Math.round(channel + ((target - channel) * percentage) / 100))
  );

  const mix = mixes.find(candidate => getContrastRatio(candidate, backgroundRGB) >= MIN_CONTRAST_RATIO) ?? mixes[100];

  return mix === mixes[0] ? color : `#${mix.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}
