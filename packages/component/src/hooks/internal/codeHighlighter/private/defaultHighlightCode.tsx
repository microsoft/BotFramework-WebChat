import { type HighlightCodeFn } from './CodeHighlighterComposer';

export const defaultHighlightCode: HighlightCodeFn = (source, language) => {
  try {
    const fragment = document.createDocumentFragment();
    const pre = document.createElement('pre');
    const code = document.createElement('code');

    code.textContent = source;

    // Follow commonmark convention
    language && code.classList.add(`language-${language}`);

    pre.append(code);
    fragment.append(pre);

    return fragment;
  } catch (error) {
    console.warn(`botframework-webchat: Failed to display code`, error);
    return '<pre></pre>';
  }
};
