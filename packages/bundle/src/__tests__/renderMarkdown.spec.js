/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import renderMarkdown from '../renderMarkdown';

describe('renderMarkdown', () => {
  it('should render markdown', () => {
    const styleSet = {
      options: {
        markdownRespectCRLF: true
      }
    };
    expect(renderMarkdown('**Hello!**', styleSet)).not.toBeFalsy();
  });

  it('should properly render newline characters to markdown', () => {
    const styleSet = {
      options: {
        markdownRespectCRLF: true
      }
    };
    expect(renderMarkdown('Same line.\nSame line.  \n2nd line.', styleSet)).toBe(
      '<p>Same line.\nSame line.<br />\n2nd line.</p>\n'
    );
  });

  it('should respect CRFL', () => {
    const styleSet = {
      options: {
        markdownRespectCRLF: true
      }
    };
    expect(renderMarkdown('Same Line.\n\rSame Line.\r\n2nd line.', styleSet)).toBe(
      '<p>Same Line.\nSame Line.</p>\n<p>2nd line.</p>\n'
    );
  });

  it('should respect LFCR', () => {
    const styleSet = { options: { markdownRespectCRLF: false } };
    expect(renderMarkdown('Same Line.\r\nSame Line.\n\r2nd line.', styleSet)).toBe(
      '<p>Same Line.\nSame Line.</p>\n<p>2nd line.</p>\n'
    );
  });

  it('should render bold text', () => {
    const styleSet = { options: { markdownRespectCRLF: true } };
    expect(renderMarkdown('**Message with Markdown**\r\nShould see bold text.', styleSet)).toBe(
      '<p><strong>Message with Markdown</strong></p>\n<p>Should see bold text.</p>\n'
    );
  });

  it('should render code correctly', () => {
    const styleSet = { options: { markdownRespectCRLF: true } };
    expect(renderMarkdown(`\`\`\`\n${JSON.stringify({ hello: 'World!' }, null, 2)}\n\`\`\``, styleSet)).toBe(
      '<pre><code>{\n  "hello": "World!"\n}\n</code></pre>\n'
    );
  });
});
