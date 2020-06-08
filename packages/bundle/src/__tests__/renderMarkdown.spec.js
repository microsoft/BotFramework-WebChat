/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import renderMarkdown from '../renderMarkdown';

describe('renderMarkdown', () => {
  it('should render markdown', () => {
    const options = { markdownRespectCRLF: true };
    expect(renderMarkdown('**Hello!**', options)).not.toBeFalsy();
  });

  it('should properly render newline characters to markdown', () => {
    const options = { markdownRespectCRLF: true };
    expect(renderMarkdown('Same line.\nSame line.  \n2nd line.', options)).toBe(
      '<p>Same line.\nSame line.<br />\n2nd line.</p>\n'
    );
  });

  it('should respect CRFL', () => {
    const options = { markdownRespectCRLF: true };
    expect(renderMarkdown('Same Line.\n\rSame Line.\r\n2nd line.', options)).toBe(
      '<p>Same Line.\nSame Line.</p>\n<p>2nd line.</p>\n'
    );
  });

  it('should respect LFCR', () => {
    const options = { markdownRespectCRLF: false };
    expect(renderMarkdown('Same Line.\r\nSame Line.\n\r2nd line.', options)).toBe(
      '<p>Same Line.\nSame Line.</p>\n<p>2nd line.</p>\n'
    );
  });

  it('should render bold text', () => {
    const options = { markdownRespectCRLF: true };
    expect(renderMarkdown('**Message with Markdown**\r\nShould see bold text.', options)).toBe(
      '<p><strong>Message with Markdown</strong></p>\n<p>Should see bold text.</p>\n'
    );
  });

  it('should render code correctly', () => {
    const options = { markdownRespectCRLF: true };
    expect(renderMarkdown(`\`\`\`\n${JSON.stringify({ hello: 'World!' }, null, 2)}\n\`\`\``, options)).toBe(
      '<pre><code>{\n  "hello": "World!"\n}\n</code></pre>\n'
    );
  });

  it('should render aria-labels', () => {
    const options = { markdownRespectCRLF: true };
    expect(renderMarkdown('[example](sample.com){aria-label="Sample label"}', options)).toBe(
      '<p><a href="sample.com" aria-label="Sample label" target="_blank" rel="noopener noreferrer">example</a></p>\n'
    );
  });

  it('should render sip protocol links correctly', () => {
    const options = { markdownRespectCRLF: true };
    expect(renderMarkdown(`[example@test.com](sip:example@test.com)`, options)).toBe(
      '<p><a href="sip:example@test.com" target="_blank" rel="noopener noreferrer">example@test.com</a></p>\n'
    );
  });

  it('should render tel protocol links correctly', () => {
    const options = { markdownRespectCRLF: true };
    expect(renderMarkdown(`[(505)503-4455](tel:505-503-4455)`, options)).toBe(
      '<p><a href="tel:505-503-4455" target="_blank" rel="noopener noreferrer">(505)503-4455</a></p>\n'
    );
  });
});
