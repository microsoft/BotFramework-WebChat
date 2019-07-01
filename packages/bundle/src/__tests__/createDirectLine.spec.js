jest.mock('botframework-directlinejs', () => {
  class DirectLine {
    constructor({ botAgent }) {
      this.botAgent = botAgent;
    }
  }

  return { DirectLine };
});

import * as WebChatFull from '../index';
import * as WebChatMinimal from '../index-minimal';
import * as WebChatES5 from '../index-es5';

describe('Web Chat createDirectLine', () => {
  it('for full bundle', () => {
    const directLine = WebChatFull.createDirectLine({});
    expect(directLine.botAgent).toBe(`WebChat/${WebChatFull.version} (Full)`);
  });

  it('for minimal bundle', () => {
    const directLine = WebChatMinimal.createDirectLine({});
    expect(directLine.botAgent).toBe(`WebChat/${WebChatMinimal.version} (Minimal)`);
  });

  it('for ES5 bundle', () => {
    const directLine = WebChatES5.createDirectLine({});
    expect(directLine.botAgent).toBe(`WebChat/${WebChatES5.version} (ES5)`);
  });
});
