import { warnOnce } from '@msinternal/botframework-webchat-base/utils';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useEffect } from 'react';
import {
  array,
  custom,
  instance,
  never,
  object,
  optional,
  pipe,
  readonly,
  string,
  undefinedable,
  union,
  type InferOutput
} from 'valibot';

const injectedStylesElementSchema = union(
  [
    custom<HTMLLinkElement & { rel: 'stylesheet' }>(
      value => value instanceof HTMLLinkElement && value.rel === 'stylesheet'
    ),
    instance(HTMLStyleElement)
  ],
  'botframework-webchat: <InjectStyleElements> supports injecting <link rel="stylesheet"> and <style> only'
);

type InjectedStylesElement = InferOutput<typeof injectedStylesElementSchema>;

const injectStyleElementsPropsSchema = pipe(
  object({
    // Intentionally set this to undefinedable() instead of optional() to remind caller they should pass styles root if they have one.
    at: undefinedable(custom<Node>(value => value instanceof Node, '"at" must be an instance of Node')),
    // Intentionally set this to undefinedable() instead of optional() to remind caller they should pass nonce if they have one.
    children: optional(never()),
    nonce: undefinedable(string()),
    styleElements: pipe(array(injectedStylesElementSchema), readonly())
  }),
  readonly()
);

type InjectStyleElementsProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  readonly at?: Node | undefined;
  // eslint does not recognize destructuring via validateProps().
  // eslint-disable-next-line react/no-unused-prop-types
  readonly nonce: string | undefined;
  // eslint-disable-next-line react/no-unused-prop-types
  readonly styleElements: readonly InjectedStylesElement[];
};

type InjectedStylesInstance = {
  readonly element: InjectedStylesElement;
  readonly mountingElement: InjectedStylesElement;
  readonly nonce: string;
  readonly root: Node;
};

const sharedInstances: InjectedStylesInstance[] = [];

const warnNonce = warnOnce('The elements passing to <InjectStyleElements> should not have "nonce" attribute set');

function InjectStyleElements(props: InjectStyleElementsProps) {
  const { at = document.head, nonce = '', styleElements } = validateProps(injectStyleElementsPropsSchema, props);

  // The <link rel="stylesheet"> and <style> element should not have nonce.
  for (const styleElement of styleElements) {
    if (styleElement.getAttribute('nonce')) {
      warnNonce();
      break;
    }
  }

  useEffect(() => {
    if (!at) {
      return;
    }

    const instancesToRemoveOnUnmount: InjectedStylesInstance[] = [];

    for (const element of styleElements) {
      let instance: InjectedStylesInstance | undefined = sharedInstances.find(
        instance => instance.element === element && instance.nonce === nonce && instance.root === at
      );

      if (!instance) {
        const mountingElement = element.cloneNode(true) as InjectedStylesElement;

        nonce ? mountingElement.setAttribute('nonce', nonce) : mountingElement.removeAttribute('nonce');

        instance = Object.freeze({
          element,
          // Deep clone is required for <style>body { ... }</style> (text node inside).
          mountingElement,
          nonce,
          root: at
        });

        mountingElement.hasAttribute('data-webchat-injected') ||
          mountingElement.setAttribute('data-webchat-injected', '');

        // When appending via useEffect(), make sure the injection order is correct.

        // ```html
        // <>
        //   <InjectStyleElements styleElements={[stylesA1, stylesA2]} />
        //   <InjectStyleElements styleElements={[stylesB]} />
        // </>
        // ```

        // Will be injected in the following order to honor CSS cascading:

        // ```html
        // <head>
        //   <style>... stylesA1 ...</style>
        //   <style>... stylesA2 ...</style>
        //   <style>... stylesB ...</style>
        // </head>
        // ```
      }

      // If the <style> elements is being reinjected, move it to the bottommost/prioritized position.
      at.appendChild(instance.mountingElement);

      // Remember instance to remove later.
      instancesToRemoveOnUnmount.push(instance);

      // Extraneous push is intentional. It is for ref counting.
      sharedInstances.push(instance);
    }

    return () => {
      for (const instance of instancesToRemoveOnUnmount) {
        const index = sharedInstances.lastIndexOf(instance);

        ~index && sharedInstances.splice(index, 1);

        // When ref count goes to zero, unmount the element.
        sharedInstances.includes(instance) || instance.mountingElement.remove();
      }
    };
  }, [at, nonce, styleElements]);

  return null;
}

export default InjectStyleElements;
export { injectStyleElementsPropsSchema, type InjectStyleElementsProps };
