export type AttributeSetter = false | string | ((value?: string) => string);

export type BetterLinkDocumentModDecoration = {
  /** Value of "aria-label" attribute of the link. If set to `false`, remove existing attribute. */
  ariaLabel?: AttributeSetter;

  /** Turns this link into a <button> with "value" attribute instead of "href". */
  asButton?: boolean;

  /** Value of "class" attribute of the link. If set to `false`, remove existing attribute. */
  className?: AttributeSetter;

  /** Alternate text of the image icon appended to the link. */
  iconAlt?: string;

  /** Class name of the image icon appended to the link. */
  iconClassName?: string;

  /** Value of "rel" attribute of the link. If set to `false`, remove existing attribute. */
  rel?: AttributeSetter;

  /** Value of "target" attribute of the link. If set to `false`, remove existing attribute. */
  target?: AttributeSetter;

  /** Value of "title" attribute of the link. If set to `false`, remove existing attribute. */
  title?: AttributeSetter;

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

function setOrRemoveAttribute(element: Element, attributeName: string, setter: AttributeSetter) {
  if (setter) {
    element.setAttribute(
      attributeName,
      typeof setter === 'function' ? setter(element.getAttribute(attributeName)) : setter
    );
  } else if (setter === false) {
    element.removeAttribute(attributeName);
  }
}

export default function betterLinkDocumentMod<T extends Document | DocumentFragment>(
  documentFragment: T,
  decorator: (href: string, textContent: string) => BetterLinkDocumentModDecoration | false | undefined
): T {
  for (const anchor of [...iterateNodeList(documentFragment.querySelectorAll('a'))]) {
    const decoration = decorator(anchor.getAttribute('href'), anchor.textContent);

    if (!decoration) {
      continue;
    }

    const { ariaLabel, asButton, className, iconAlt, iconClassName, rel, target, title, wrapZeroWidthSpace } =
      decoration;

    setOrRemoveAttribute(anchor, 'aria-label', ariaLabel);
    setOrRemoveAttribute(anchor, 'class', className);
    setOrRemoveAttribute(anchor, 'title', title);

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

      anchor.hasAttribute('aria-label') && button.setAttribute('aria-label', anchor.getAttribute('aria-label'));
      anchor.hasAttribute('class') && button.setAttribute('class', anchor.getAttribute('class'));
      anchor.hasAttribute('title') && button.setAttribute('title', anchor.getAttribute('title'));
      button.setAttribute('type', 'button');
      button.setAttribute('value', anchor.getAttribute('href'));
      button.textContent = anchor.textContent;
      button.append(...anchor.children);

      anchor.replaceWith(button);

      if (wrapZeroWidthSpace) {
        button.insertAdjacentText('beforebegin', ZERO_WIDTH_SPACE);
        button.insertAdjacentText('afterend', ZERO_WIDTH_SPACE);
      }
    } else {
      setOrRemoveAttribute(anchor, 'rel', rel);
      setOrRemoveAttribute(anchor, 'target', target);

      if (wrapZeroWidthSpace) {
        anchor.insertAdjacentText('beforebegin', ZERO_WIDTH_SPACE);
        anchor.insertAdjacentText('afterend', ZERO_WIDTH_SPACE);
      }
    }
  }

  return documentFragment;
}
