import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

import useCodeBlockTag from '../CustomElements/useCodeBlockTagName';
import useHTMLContentTransformContext from './private/useHTMLContentTransformContext';

const { useLocalizer, useStyleOptions } = hooks;

const DEFAULT_ALLOWED_TAGS: ReadonlyMap<string, Readonly<{ attributes: ReadonlySet<string> }>> = Object.freeze(
  new Map(
    (
      [
        ['a', ['aria-label', 'class', 'href', 'name', 'rel', 'target']],
        ['b', []],
        ['blockquote', []],
        ['br', []],
        ['button', ['aria-label', 'class', 'type', 'value']],
        ['caption', []],
        ['code', ['data-math-type']],
        ['del', []],
        ['div', []],
        ['em', []],
        ['figure', ['data-math-type', 'tabindex']],
        ['h1', []],
        ['h2', []],
        ['h3', []],
        ['h4', []],
        ['h5', []],
        ['h6', []],
        ['hr', []],
        ['i', []],
        ['img', ['alt', 'aria-label', 'class', 'src', 'title']],
        ['ins', []],
        ['li', []],
        ['nl', []],
        ['ol', []],
        ['p', []],
        ['pre', ['class', 'data-math-type']],
        ['s', []],
        ['span', ['aria-label', 'data-math-type']],
        ['strike', []],
        ['strong', []],
        ['table', []],
        ['tbody', []],
        ['td', []],
        ['tfoot', []],
        ['th', []],
        ['thead', []],
        ['tr', []],
        ['ul', []],

        // Followings are for MathML elements, from https://developer.mozilla.org/en-US/docs/Web/MathML.
        ['annotation-xml', ['encoding', 'src', 'name', 'definitionURL']],
        ['annotation', ['encoding', 'src', 'name', 'definitionURL']],
        ['math', ['display', 'xmlns', 'mode', 'overflow', 'alttext', 'mathbackground', 'mathcolor']],
        ['merror', ['mathbackground', 'mathcolor']],
        ['mfenced', ['close', 'open', 'separators']],
        ['mfrac', ['linethickness', 'numalign', 'denomalign', 'bevelled']],
        ['mi', ['mathvariant', 'mathsize', 'mathbackground', 'mathcolor']],
        ['mmultiscripts', ['subscriptshift', 'superscriptshift']],
        ['mn', ['mathvariant', 'mathsize', 'mathbackground', 'mathcolor']],
        [
          'mo',
          [
            'form',
            'fence',
            'separator',
            'lspace',
            'rspace',
            'stretchy',
            'symmetric',
            'maxsize',
            'minsize',
            'largeop',
            'movablelimits',
            'accent',
            'linebreak',
            'mathvariant',
            'mathsize',
            'mathbackground',
            'mathcolor'
          ]
        ],
        ['mover', ['accent', 'align']],
        ['mpadded', ['height', 'width', 'depth', 'lspace', 'voffset']],
        ['mphantom', ['mathbackground']],
        ['mprescripts', []],
        ['mroot', ['mathbackground', 'mathcolor']],
        ['mrow', ['dir', 'mathbackground', 'mathcolor']],
        ['ms', ['lquote', 'rquote', 'mathvariant', 'mathsize', 'mathbackground', 'mathcolor']],
        [
          'mspace',
          [
            'linebreak',
            'width',
            'height',
            'depth',
            'mediummathspace',
            'negativemediummathspace',
            'negativethickmathspace',
            'negativethinmathspace',
            'negativeverythickmathspace',
            'negativeverythinmathspace',
            'thickmathspace',
            'thinmathspace',
            'verythickmathspace',
            'verythinmathspace'
          ]
        ],
        ['msqrt', ['mathbackground', 'mathcolor']],
        [
          'mstyle',
          [
            'scriptlevel',
            'displaystyle',
            'scriptsizemultiplier',
            'scriptminsize',
            'infixlinebreakstyle',
            'decimalpoint',
            'mathvariant',
            'mathsize',
            'mathbackground',
            'mathcolor',
            'dir'
          ]
        ],
        ['msub', ['subscriptshift']],
        ['msubsup', ['subscriptshift', 'superscriptshift']],
        ['msup', ['superscriptshift']],
        [
          'mtable',
          [
            'align',
            'rowalign',
            'columnalign',
            'groupalign',
            'alignmentscope',
            'columnwidth',
            'width',
            'rowspacing',
            'columnspacing',
            'rowlines',
            'columnlines',
            'frame',
            'framespacing',
            'equalrows',
            'equalcolumns',
            'displaystyle',
            'side',
            'minlabelspacing'
          ]
        ],
        ['mtd', ['rowspan', 'columnspan', 'rowalign', 'columnalign', 'groupalign']],
        ['mtext', ['mathvariant', 'mathsize', 'mathbackground', 'mathcolor']],
        ['mtr', ['rowalign', 'columnalign', 'groupalign']],
        ['munder', ['accentunder', 'align']],
        ['munderover', ['accent', 'accentunder', 'align']],
        ['semantics', ['definitionURL', 'encoding']]
      ] satisfies [string, string[]][]
    ).map(
      ([tag, attributes]) =>
        [tag, Object.freeze({ attributes: Object.freeze(new Set(attributes)) })] satisfies [
          string,
          Readonly<{ attributes: ReadonlySet<string> }>
        ]
    )
  )
);

export default function useTransformHTMLContent(): (documentFragment: DocumentFragment) => DocumentFragment {
  const [{ codeBlockTheme }] = useStyleOptions();
  const [codeBlockTagName] = useCodeBlockTag();
  const { transform } = useHTMLContentTransformContext();

  const localize = useLocalizer();
  const externalLinkAlt = localize('MARKDOWN_EXTERNAL_LINK_ALT');

  return useCallback(
    documentFragment =>
      transform({
        allowedTags: DEFAULT_ALLOWED_TAGS,
        codeBlockTagName,
        codeBlockTheme,
        documentFragment,
        externalLinkAlt
      }),
    [codeBlockTagName, codeBlockTheme, externalLinkAlt, transform]
  );
}
