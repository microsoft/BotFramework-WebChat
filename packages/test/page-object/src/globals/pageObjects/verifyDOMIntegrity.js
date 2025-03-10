// We are trying our best effort to check for DOM tree integrity.
// When we extend this function, we should also consider using open source tools to verify.
export default function verifyDOMIntegrity() {
  // If an element has "aria-labelledby", the label element must be present on the screen.
  [].forEach.call(document.querySelectorAll('[aria-labelledby]'), element => {
    element
      .getAttribute('aria-labelledby')
      .split(' ')
      .map(labelId => labelId.trim())
      .filter(Boolean)
      .forEach(labelId => {
        const labelElement = document.getElementById(labelId);

        if (!labelElement) {
          const message = `verifyDOMIntegrity: Cannot find element referenced by aria-labelledby attribute with ID "${labelId}".`;

          console.warn(message, element);

          throw new Error(message);
        }
      });
  });

  // No two elements can have the same ID.
  [].forEach.call(document.querySelectorAll('[id]'), element => {
    const id = element.getAttribute('id');
    const elementsWithId = document.querySelectorAll(`#${id}`);

    if (elementsWithId.length > 1) {
      const message = `Only one element can have ID "${id}", we saw ${elementsWithId.length} elements sharing same ID.`;

      console.warn(message, elementsWithId);

      throw new Error(message);
    }
  });

  // No class attribute should have the word "undefined" in it
  [].forEach.call(document.querySelectorAll('[class]'), element => {
    const className = element.getAttribute('class');

    if (~className.indexOf('undefined')) {
      const message = `No elements should have the keyword "undefined" in it, we saw "${className}".`;

      console.warn(message, element);

      throw new Error(message);
    }
  });

  // Elements of `role="heading"` must have `aria-level` set
  [].forEach.call(document.querySelectorAll('[role="heading"]'), element => {
    const ariaLevel = +element.getAttribute('aria-level');

    if (!(ariaLevel >= 1 && ariaLevel === ~~ariaLevel)) {
      const message = 'Elements of role="heading" must have aria-level set to an integer equal to or greater than 1.';

      console.warn(message, element);

      throw new Error(message);
    }
  });

  // Elements of `role="feed"` must have at least 1 child of <article> or `role="article"`
  [].forEach.call(document.querySelectorAll('[role="feed"]'), element => {
    const hasArticle = [].some.call(element.children, child => child.matches('article, [role="article"]'));

    if (!hasArticle) {
      const message = 'Elements of role="feed" must have at least 1 children of <article> or role="article".';

      console.warn(message, element);

      throw new Error(message);
    }
  });
}
