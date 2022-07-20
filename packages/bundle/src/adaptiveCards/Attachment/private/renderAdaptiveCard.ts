import type {
  AdaptiveCard,
  GlobalSettings as GlobalSettingsType,
  HostConfig as HostConfigType,
  IMarkdownProcessingResult
} from 'adaptivecards';

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
  // Currently, the only way to set the Markdown engine is to set it thru static member of AdaptiveCard class

  // TODO: [P3] Checks if we could make the "renderMarkdownAsHTML" per card
  //       This could be limitations from Adaptive Cards package (not supported as of 1.2.5)
  //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine

  // "onProcessMarkdown" is a static function but we are trying to scope it to the current object instead.
  // eslint-disable-next-line dot-notation
  adaptiveCard.constructor['onProcessMarkdown'] = (text: string, result: IMarkdownProcessingResult) => {
    if (renderMarkdownAsHTML) {
      result.outputHtml = renderMarkdownAsHTML(text);
      result.didProcess = true;
    }
  };

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
