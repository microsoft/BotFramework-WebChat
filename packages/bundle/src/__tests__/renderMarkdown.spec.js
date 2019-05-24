import renderMarkdown from '../renderMarkdown';

describe('renderMarkdown', () => {
  it('should render markdown', () => {
    expect(renderMarkdown('**Hello!**')).not.toBeFalsy();
  });

  it('should properly render newline characters to markdown', () => {
    expect(renderMarkdown('Same line.\nSame line.  \n2nd line.\n\r3rd line.')).toBe(
      '<p>Same line.\nSame line.<br />\n2nd line.</p>\n<p>3rd line.</p>\n'
    );
  });
});
