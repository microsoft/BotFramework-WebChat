import type { AdaptiveCard, IMarkdownProcessingResult } from 'adaptivecards';

export default function setMarkdownEngine(
  adaptiveCard: AdaptiveCard,
  renderMarkdownAsHTML: ((markdown: string) => string) | undefined
): void {
  // Currently, the only way to set the Markdown engine is to set it thru static member of AdaptiveCard class

  // TODO: [P3] Checks if we could make the "renderMarkdownAsHTML" per card
  //       This could be limitations from Adaptive Cards package (not supported as of 1.2.5)
  //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine

  // "onProcessMarkdown" is a static function but we are trying to scope it to the current object instead.
  adaptiveCard.constructor['onProcessMarkdown'] = (text: string, result: IMarkdownProcessingResult) => {
    if (renderMarkdownAsHTML) {
      result.outputHtml = renderMarkdownAsHTML(text);
      result.didProcess = true;
    }
  };
}
