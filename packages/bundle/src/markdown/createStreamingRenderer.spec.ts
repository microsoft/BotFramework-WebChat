/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import createStreamingRenderer from './createStreamingRenderer';

const OPTIONS: Parameters<typeof createStreamingRenderer>[0] = {
  markdownRespectCRLF: false
};

const INIT: Parameters<typeof createStreamingRenderer>[1] = {
  externalLinkAlt: 'Opens in a new window'
};

function setup() {
  const container = document.createElement('div');

  document.body.appendChild(container);

  const renderer = createStreamingRenderer(OPTIONS, INIT);

  const nextOptions = () => ({ container });

  return { container, nextOptions, renderer };
}

function getWrapperHTML(container: HTMLElement): string {
  const wrapper = container.firstElementChild;

  return wrapper ? wrapper.innerHTML : '';
}

// Returns the comment node that separates committed from active content.
function getSentinel(container: HTMLElement): Comment | null {
  const wrapper = container.firstElementChild;

  if (!wrapper) {
    return null;
  }

  for (const child of Array.from(wrapper.childNodes)) {
    if (child.nodeType === Node.COMMENT_NODE) {
      return child as Comment;
    }
  }

  return null;
}

// Returns [committedHTML, activeHTML] split by the sentinel comment.
// Uses Range to extract each half into a fragment, then serializes via innerHTML.
function splitBySentinel(container: HTMLElement): [string, string] | null {
  const sentinel = getSentinel(container);

  if (!sentinel) {
    return null;
  }

  const wrapper = container.firstElementChild!;

  const committedRange = document.createRange();

  committedRange.setStartBefore(wrapper.firstChild!);
  committedRange.setEndBefore(sentinel);

  const activeRange = document.createRange();

  activeRange.setStartAfter(sentinel);
  activeRange.setEndAfter(wrapper.lastChild!);

  const committedDiv = document.createElement('div');
  const activeDiv = document.createElement('div');

  committedDiv.appendChild(committedRange.cloneContents());
  activeDiv.appendChild(activeRange.cloneContents());

  return [committedDiv.innerHTML.trim(), activeDiv.innerHTML.trim()];
}

describe('createStreamingRenderer', () => {
  describe('single block', () => {
    test('should render a paragraph without sentinel', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('Hello, World!', nextOptions());

      expect(getWrapperHTML(container)).toBe('<p>Hello, World!</p>');
      expect(getSentinel(container)).toBeNull();
    });

    test('should render inline formatting within a single block', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('Hello **bo', nextOptions());
      renderer.next('ld** and *ita', nextOptions());
      renderer.next('lic*', nextOptions());

      expect(getWrapperHTML(container)).toBe('<p>Hello <strong>bold</strong> and <em>italic</em></p>');
      expect(getSentinel(container)).toBeNull();
    });
  });

  describe('multi-block split', () => {
    test('should split two paragraphs into committed and active', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('First paragraph\n\nSecond paragraph', nextOptions());

      const split = splitBySentinel(container);

      expect(split).not.toBeNull();
      expect(split![0]).toBe('<p>First paragraph</p>');
      expect(split![1]).toBe('<p>Second paragraph</p>');
    });

    test('should preserve newline between paragraphs in textContent', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('First\n\nSecond', nextOptions());

      expect(container.textContent).toContain('First');
      expect(container.textContent).toContain('Second');
      expect(container.textContent).toMatch(/First\s+Second/u);
    });

    test('should split three paragraphs with two committed and one active', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('Block A\n\nBlock B\n\nBlock C', nextOptions());

      const split = splitBySentinel(container);

      expect(split).not.toBeNull();
      expect(split![0]).toContain('Block A');
      expect(split![0]).toContain('Block B');
      expect(split![1]).toBe('<p>Block C</p>');
    });

    test('should preserve newline in textContent for code span followed by paragraph', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('`t=undefined`\n\nA quick', nextOptions());

      // The \n between the two <p> blocks must survive the committed/active split.
      expect(container.textContent).toMatch(/t=undefined\nA quick/u);
    });
  });

  describe('htmlFlow blocks', () => {
    test('should keep multi-element htmlFlow block whole in committed split', () => {
      const { container, nextOptions, renderer } = setup();

      // htmlFlow that produces two sibling <img> elements, followed by a paragraph.
      renderer.next('<img src="a.png">\n<img src="b.png">\n\nTrailing paragraph', nextOptions());

      const split = splitBySentinel(container);

      expect(split).not.toBeNull();

      // Both <img> must be in committed; the paragraph is the active block.
      expect(split![0]).toContain('<img src="a.png">');
      expect(split![0]).toContain('<img src="b.png">');
      expect(split![1]).toBe('<p>Trailing paragraph</p>');
    });

    test('should render htmlFlow as single block without sentinel', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('<div>Hello</div>', nextOptions());

      expect(getWrapperHTML(container)).toBe('<div>Hello</div>');
      expect(getSentinel(container)).toBeNull();
    });
  });

  describe('incremental streaming (append-only chunks)', () => {
    test('should accumulate single block content without sentinel', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('Hello', nextOptions());

      expect(getWrapperHTML(container)).toBe('<p>Hello</p>');
      expect(getSentinel(container)).toBeNull();

      renderer.next(' World', nextOptions());

      expect(getWrapperHTML(container)).toBe('<p>Hello World</p>');
      expect(getSentinel(container)).toBeNull();
    });

    test('should promote first block to committed when new block starts', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('First block', nextOptions());

      expect(getSentinel(container)).toBeNull();

      renderer.next('\n\nSecond block', nextOptions());

      const split = splitBySentinel(container);

      expect(split).not.toBeNull();
      expect(split![0]).toBe('<p>First block</p>');
      expect(split![1]).toBe('<p>Second block</p>');
    });

    test('should grow active block via incremental path', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('Block 1\n\nPartial', nextOptions());

      const split1 = splitBySentinel(container);

      expect(split1).not.toBeNull();
      expect(split1![1]).toBe('<p>Partial</p>');

      renderer.next(' more text', nextOptions());

      const split2 = splitBySentinel(container);

      expect(split2).not.toBeNull();
      expect(split2![0]).toBe('<p>Block 1</p>');
      expect(split2![1]).toBe('<p>Partial more text</p>');
    });

    test('should commit additional blocks during incremental streaming', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('Block A\n\nBlock B', nextOptions());

      const split1 = splitBySentinel(container);

      expect(split1![0]).toBe('<p>Block A</p>');
      expect(split1![1]).toBe('<p>Block B</p>');

      // Append a new block boundary — Block B becomes committed, Block C is active.
      renderer.next('\n\nBlock C', nextOptions());

      const split2 = splitBySentinel(container);

      expect(split2).not.toBeNull();
      expect(split2![0]).toContain('Block A');
      expect(split2![0]).toContain('Block B');
      expect(split2![1]).toBe('<p>Block C</p>');
    });
  });

  describe('reset', () => {
    test('should clear state and render new content from scratch', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('First\n\nSecond', nextOptions());

      expect(getSentinel(container)).not.toBeNull();

      renderer.reset();

      renderer.next('Fresh start', nextOptions());

      expect(getWrapperHTML(container)).toBe('<p>Fresh start</p>');
      expect(getSentinel(container)).toBeNull();
    });
  });

  describe('finalize', () => {
    test('should do full reparse and remove sentinel', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('Block 1\n\nBlock 2', nextOptions());

      expect(getSentinel(container)).not.toBeNull();

      renderer.finalize(nextOptions());

      expect(getSentinel(container)).toBeNull();
      expect(getWrapperHTML(container)).toContain('Block 1');
      expect(getWrapperHTML(container)).toContain('Block 2');
    });

    test('should extract link definitions', () => {
      const { nextOptions, renderer } = setup();

      renderer.next('See [link][1]\n\n[1]: https://example.com "Example"', nextOptions());

      const { definitions } = renderer.finalize(nextOptions());

      expect(definitions).toEqual(
        expect.arrayContaining([expect.objectContaining({ identifier: '1', url: 'https://example.com' })])
      );
    });

    test('should render empty container when no markdown was passed', () => {
      const { container, nextOptions, renderer } = setup();

      const { definitions } = renderer.finalize(nextOptions());

      expect(getWrapperHTML(container)).toBe('');
      expect(definitions).toEqual([]);
    });
  });

  describe('non-append reset and re-render', () => {
    test('should fall back to full reparse when new markdown does not start with previous', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('Block 1\n\nBlock 2', nextOptions());

      // Simulate non-append-only update (e.g., streaming content replaced entirely).
      renderer.reset();

      renderer.next('Replaced\n\nContent', nextOptions());

      const split = splitBySentinel(container);

      expect(split).not.toBeNull();
      expect(split![0]).toBe('<p>Replaced</p>');
      expect(split![1]).toBe('<p>Content</p>');
    });
  });

  describe('code blocks', () => {
    test('should split fenced code block from trailing paragraph', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('```js\nconsole.log("hi");\n```\n\nDone', nextOptions());

      const split = splitBySentinel(container);

      expect(split).not.toBeNull();
      expect(split![0]).toContain('<code');
      expect(split![1]).toBe('<p>Done</p>');
    });
  });

  describe('heading and paragraph', () => {
    test('should split heading from following paragraph', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('# Title\n\nBody text', nextOptions());

      const split = splitBySentinel(container);

      expect(split).not.toBeNull();
      expect(split![0]).toBe('<h1>Title</h1>');
      expect(split![1]).toBe('<p>Body text</p>');
    });
  });

  describe('thematic break', () => {
    test('should split at thematic break', () => {
      const { container, nextOptions, renderer } = setup();

      renderer.next('Above\n\n---\n\nBelow', nextOptions());

      const split = splitBySentinel(container);

      expect(split).not.toBeNull();
      expect(split![0]).toContain('Above');
      expect(split![0]).toContain('<hr');
      expect(split![1]).toBe('<p>Below</p>');
    });
  });
});
