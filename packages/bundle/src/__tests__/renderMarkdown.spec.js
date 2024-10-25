/** @jest-environment jsdom */
/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import renderMarkdown from '../markdown/renderMarkdown';

describe('renderMarkdown', () => {
  const renderMarkdownOptions = {
    codeBlockCopyButtonTagName: 'webchat__code-block-copy-button',
    copyButtonAlt: 'Copy',
    copyButtonCopiedAlt: 'Copied'
  };

  it('should render markdown', () => {
    const styleOptions = { markdownRespectCRLF: true };

    expect(renderMarkdown('**Hello!**', styleOptions, renderMarkdownOptions)).not.toBeFalsy();
  });

  it('should properly render newline characters to markdown', () => {
    const styleOptions = { markdownRespectCRLF: true };

    expect(renderMarkdown('Same line.\nSame line.  \n2nd line.', styleOptions, renderMarkdownOptions)).toBe(
      '<p>Same line.\nSame line.<br />\n2nd line.</p>'
    );
  });

  it('should respect CRLF', () => {
    const styleOptions = { markdownRespectCRLF: true };

    expect(renderMarkdown('Same Line.\n\rSame Line.\r\n2nd line.', styleOptions, renderMarkdownOptions)).toBe(
      '<p>Same Line.\nSame Line.</p>\n<p>2nd line.</p>'
    );
  });

  it('should respect LFCR', () => {
    const styleOptions = { markdownRespectCRLF: false };

    expect(renderMarkdown('Same Line.\r\nSame Line.\n\r2nd line.', styleOptions, renderMarkdownOptions)).toBe(
      '<p>Same Line.\nSame Line.</p>\n<p>2nd line.</p>'
    );
  });

  it('should render bold text', () => {
    const styleOptions = { markdownRespectCRLF: true };

    expect(
      renderMarkdown('**Message with Markdown**\r\nShould see bold text.', styleOptions, renderMarkdownOptions)
    ).toBe('<p><strong>Message with Markdown</strong></p>\n<p>Should see bold text.</p>');
  });

  it('should render code correctly', () => {
    const styleOptions = { markdownRespectCRLF: true };

    expect(
      renderMarkdown(
        `\`\`\`\n${JSON.stringify({ hello: 'World!' }, null, 2)}\n\`\`\``,
        styleOptions,
        renderMarkdownOptions
      )
    ).toBe(`<pre class="webchat__render-markdown__code-block"><webchat__code-block-copy-button data-value="{
  &quot;hello&quot;: &quot;World!&quot;
}
"></webchat__code-block-copy-button><code>{
  "hello": "World!"
}
</code></pre>`);
  });

  it('should render aria-labels', () => {
    const styleOptions = { markdownRespectCRLF: true };

    expect(renderMarkdown('[example](https://sample.com)', styleOptions, renderMarkdownOptions)).toBe(
      `<p>\u200B<a href="https://sample.com" aria-label="example " rel="noopener noreferrer" target="_blank">example<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" class="webchat__render-markdown__external-link-icon" /></a>\u200B</p>`
    );
  });

  it('should render "open in new window" icon', () => {
    const styleOptions = { markdownRespectCRLF: true };
    const options = { externalLinkAlt: 'Opens in a new window, external.' };

    expect(renderMarkdown('[example](https://sample.com)', styleOptions, options)).toBe(
      `<p>\u200B<a href="https://sample.com" aria-label="example Opens in a new window, external." rel="noopener noreferrer" target="_blank">example<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" class="webchat__render-markdown__external-link-icon" title="Opens in a new window, external." /></a>\u200B</p>`
    );
  });

  it('should render sip protocol links correctly', () => {
    const styleOptions = { markdownRespectCRLF: true };

    expect(renderMarkdown(`[example@test.com](sip:example@test.com)`, styleOptions, renderMarkdownOptions)).toBe(
      '<p>\u200B<a href="sip:example@test.com" rel="noopener noreferrer" target="_blank">example@test.com</a>\u200B</p>'
    );
  });

  it('should render tel protocol links correctly', () => {
    const styleOptions = { markdownRespectCRLF: true };

    expect(renderMarkdown(`[(505)503-4455](tel:505-503-4455)`, styleOptions, renderMarkdownOptions)).toBe(
      '<p>\u200B<a href="tel:505-503-4455" rel="noopener noreferrer" target="_blank">(505)503-4455</a>\u200B</p>'
    );
  });

  it('should render strikethrough text correctly', () => {
    const styleOptions = { markdownRespectCRLF: true };

    expect(renderMarkdown(`~~strike text~~`, styleOptions, renderMarkdownOptions)).toBe(
      '<p><del>strike text</del></p>'
    );
  });
});
