import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';

const customMarkdownIt = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
  typographer: true,
  xhtmlOut: true
}).use(iterator, 'url_new_win', 'link_open', (tokens, index) => {
  // TODO: [P4] This is copied from v3 and looks clunky
  //       We should refactor this code
  const targetAttrIndex = tokens[index].attrIndex('target');

  if (~targetAttrIndex) {
    tokens[index].attrs[targetAttrIndex][1] = '_blank';
  } else {
    tokens[index].attrPush(['target', '_blank']);
  }

  const relAttrIndex = tokens[index].attrIndex('rel');

  if (~relAttrIndex) {
    tokens[index].attrs[relAttrIndex][1] = 'noopener noreferrer';
  } else {
    tokens[index].attrPush(['target', 'noopener noreferrer']);
  }
});

export default customMarkdownIt.render.bind(customMarkdownIt)
