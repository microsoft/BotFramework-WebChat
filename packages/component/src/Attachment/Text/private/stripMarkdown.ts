import MarkdownIt from 'markdown-it';

export default function stripMarkdown(markdown: string): string {
  const markdownIt = new MarkdownIt({
    breaks: false,
    html: false,
    linkify: true,
    typographer: true,
    xhtmlOut: true
  });

  const html = markdownIt.render(markdown);

  const element = document.createElement('div');

  element.innerHTML = html;

  return element.textContent || '';
}
