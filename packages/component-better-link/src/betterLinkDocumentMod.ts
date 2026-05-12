import copyAttribute from './private/copyAttribute';

type BetterLinkDocumentModAttributeSetter = false | string | ((value?: string | undefined) => string);

type BetterLinkDocumentModDecoration = {
  /** Value of "aria-label" attribute of the link. If set to `false`, remove existing attribute. */
  ariaLabel?: BetterLinkDocumentModAttributeSetter;

  /** Turns this link into a <button> with "value" attribute instead of "href". */
  asButton?: boolean;

  /** Value of "class" attribute of the link. If set to `false`, remove existing attribute. */
  className?: BetterLinkDocumentModAttributeSetter;

  /** Alternate text of the image icon appended to the link. */
  iconAlt?: string;

  /** Class name of the image icon appended to the link. */
  iconClassName?: string;

  /** Value of "rel" attribute of the link. If set to `false`, remove existing attribute. */
  rel?: BetterLinkDocumentModAttributeSetter;

  /** Value of "target" attribute of the link. If set to `false`, remove existing attribute. */
  target?: BetterLinkDocumentModAttributeSetter;

  /** Value of "title" attribute of the link. If set to `false`, remove existing attribute. */
  title?: BetterLinkDocumentModAttributeSetter;

  /** Wraps the link with zero-width space. */
  wrapZeroWidthSpace?: boolean;
};

const ZERO_WIDTH_SPACE = '\u200b';

function* iterateNodeList<T extends Node>(nodeList: NodeListOf<T>) {
  const { length } = nodeList;

  for (let index = 0; index < length; index++) {
    yield nodeList.item(index);
  }
}

const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function setOrRemoveAttribute(element: Element, attributeName: string, setter: BetterLinkDocumentModAttributeSetter) {
  if (setter) {
    element.setAttribute(
      attributeName,
      typeof setter === 'function' ? setter(element.getAttribute(attributeName) ?? undefined) : setter
    );
  } else if (setter === false) {
    element.removeAttribute(attributeName);
  }
}

function betterLinkDocumentMod<T extends Document | DocumentFragment>(
  documentFragment: T,
  decorator: (href: string | undefined, textContent: string) => BetterLinkDocumentModDecoration | false | undefined
): T {
  for (const anchor of [...iterateNodeList(documentFragment.querySelectorAll('a'))]) {
    const decoration = decorator(anchor.getAttribute('href') ?? undefined, anchor.textContent);

    if (!decoration) {
      continue;
    }

    const { ariaLabel, asButton, className, iconAlt, iconClassName, rel, target, title, wrapZeroWidthSpace } =
      decoration;

    setOrRemoveAttribute(anchor, 'aria-label', ariaLabel ?? false);
    setOrRemoveAttribute(anchor, 'class', className ?? false);
    setOrRemoveAttribute(anchor, 'title', title ?? false);

    if (iconClassName) {
      const image = document.createElement('img');

      image.setAttribute('src', TRANSPARENT_GIF);
      image.setAttribute('alt', '');
      image.classList.add(iconClassName);
      iconAlt && image.setAttribute('title', iconAlt);

      anchor.insertAdjacentElement('beforeend', image);
    }

    if (asButton) {
      const button = document.createElement('button');

      copyAttribute(anchor, button, 'aria-label');
      copyAttribute(anchor, button, 'class');
      copyAttribute(anchor, button, 'title');

      button.setAttribute('type', 'button');
      button.setAttribute('value', anchor.getAttribute('href') ?? ''); // Need empty string, otherwise, value="null".
      button.textContent = anchor.textContent;
      button.append(...anchor.children);

      anchor.replaceWith(button);

      if (wrapZeroWidthSpace) {
        button.insertAdjacentText('beforebegin', ZERO_WIDTH_SPACE);
        button.insertAdjacentText('afterend', ZERO_WIDTH_SPACE);
      }
    } else {
      setOrRemoveAttribute(anchor, 'rel', rel ?? false);
      setOrRemoveAttribute(anchor, 'target', target ?? false);

      if (wrapZeroWidthSpace) {
        anchor.insertAdjacentText('beforebegin', ZERO_WIDTH_SPACE);
        anchor.insertAdjacentText('afterend', ZERO_WIDTH_SPACE);
      }
    }
  }

  return documentFragment;
}

export default betterLinkDocumentMod;
export type { BetterLinkDocumentModAttributeSetter, BetterLinkDocumentModDecoration };
