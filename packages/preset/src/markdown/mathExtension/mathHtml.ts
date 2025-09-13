import { type HtmlExtension, type Token } from 'micromark-util-types';

export type CreateHtmlRendererOptions = {
  renderMath?: ((content: string, isDisplay: boolean) => string) | undefined;
};

export default function mathHtml(options: CreateHtmlRendererOptions = {}): HtmlExtension {
  return {
    exit: {
      // @ts-expect-error math* are not known tokens in micromark
      mathContent(token: Token) {
        this.setData('content', this.sliceSerialize(token));
      },
      math(token: Token & { isInline: boolean; isDisplay: boolean }) {
        const { isInline, isDisplay } = token;
        const content = this.getData('content');

        const defaults =
          isDisplay && !isInline
            ? ({ tag: options.renderMath ? 'figure' : 'pre', type: 'block' } as const)
            : ({ tag: 'span', type: isDisplay ? 'block' : 'inline' } as const);

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
  };
}
