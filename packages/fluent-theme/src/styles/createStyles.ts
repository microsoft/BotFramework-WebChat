export const fluentStyleContent = '@--FLUENT-STYLES-CONTENT--@';

export default function createStyles() {
  if (!globalThis.CSSStyleSheet) {
    return [];
  }

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(fluentStyleContent);
  return [sheet];
}
