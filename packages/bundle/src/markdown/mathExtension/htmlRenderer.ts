import { type HtmlExtension, type Token } from 'micromark-util-types';

export type CreateHtmlRendererOptions = {
  renderMath?: ((content: string, isDisplay: boolean) => string) | undefined;
};

function extractMathContent(value) {
  const isDisplay = value.startsWith('\\[');
  const start = value.indexOf(isDisplay ? '[' : '(') + 1;
  const end = value.lastIndexOf(isDisplay ? ']' : ')') - 1;
  return {
    content: value.slice(start, end).trim(),
    isDisplay
  };
}

export default function createHtmlRenderer(options: CreateHtmlRendererOptions = {}): HtmlExtension {
  return {
    exit: {
      math(token: Token) {
        const { content, isDisplay } = extractMathContent(this.sliceSerialize(token));
        const defaults = isDisplay
          ? ({ tag: options.renderMath ? 'figure' : 'pre', type: 'block' } as const)
          : ({ tag: 'span', type: 'inline' } as const);

        const render = (
          content: string,
          type: 'block' | 'inline' | 'error' = defaults.type,
          tag: 'figure' | 'span' | 'pre' | 'code' = defaults.tag
        ) => {
          // Math could be scrollable, need to be tabbable.
          this.tag(`<${tag} data-math-type="${type}" tabindex="0">`);
          this.raw(content);
          this.tag(`</${tag}>`);
        };

        try {
          render(options.renderMath?.(content, isDisplay) ?? content);
        } catch (error) {
          console.warn('Math rendering error:', error);
          render(content, 'error', isDisplay ? 'pre' : 'code');
        }
      }
    }
  } as any;
}
