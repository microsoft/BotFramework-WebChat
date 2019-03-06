import renderMarkdown from '../renderMarkdown';

describe('renderMarkdown', () => {
  it('should render markdown', () => {
    expect(renderMarkdown('**Hello!**')).not.toBeFalsy();
  });
});
