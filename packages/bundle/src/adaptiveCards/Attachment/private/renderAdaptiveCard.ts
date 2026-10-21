import type { AdaptiveCard, GlobalSettings as GlobalSettingsType, HostConfig as HostConfigType } from 'adaptivecards';

import setMarkdownEngine from './setMarkdownEngine';

/**
 * Returns `true`, if the object is a plain object and not a class, otherwise, `false`.
 */
function isPlainObject(obj) {
  return Object.getPrototypeOf(obj) === Object.prototype;
}

export default function renderAdaptiveCard(
  adaptiveCard: AdaptiveCard,
  {
    adaptiveCardsHostConfig,
    adaptiveCardsPackage: { GlobalSettings, HostConfig },
    renderMarkdownAsHTML,
    setTabIndexAtCardRoot
  }: {
    adaptiveCardsHostConfig?: HostConfigType;
    adaptiveCardsPackage: {
      GlobalSettings: typeof GlobalSettingsType;
      HostConfig: typeof HostConfigType;
    };
    renderMarkdownAsHTML?: (markdown: string) => string;
    setTabIndexAtCardRoot: boolean;
  }
): { element: HTMLElement } | { errors: Error[] } {
  setMarkdownEngine(adaptiveCard, renderMarkdownAsHTML);

  if (adaptiveCardsHostConfig) {
    adaptiveCard.hostConfig = isPlainObject(adaptiveCardsHostConfig)
      ? new HostConfig(adaptiveCardsHostConfig)
      : adaptiveCardsHostConfig;
  }

  // For accessibility issue #1340, `tabindex="0"` must not be set for the root container if it is not interactive.
  GlobalSettings.setTabIndexAtCardRoot = setTabIndexAtCardRoot;

  const { validationEvents } = adaptiveCard.validateProperties();

  if (validationEvents.length) {
    return { errors: validationEvents.reduce((items, { message }) => [...items, new Error(message)], [] as Error[]) };
  }

  let element: HTMLElement | undefined;

  try {
    element = adaptiveCard.render();
  } catch (error) {
    return { errors: [error] };
  }

  if (!element) {
    return { errors: [new Error('Adaptive Card rendered as empty element')] };
  }

  return { element };
}
