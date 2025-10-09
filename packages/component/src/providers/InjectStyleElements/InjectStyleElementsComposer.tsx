import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyleOptions } from 'botframework-webchat-api/hook';
import { memo, useEffect, type FunctionComponent } from 'react';
import { array, custom, instance, object, optional, pipe, readonly, union, type InferOutput } from 'valibot';

const injectedStylesElementSchema = union(
  [
    custom<HTMLLinkElement & { rel: 'stylesheet' }>(
      value => value instanceof HTMLLinkElement && value.rel === 'stylesheet'
    ),
    instance(HTMLStyleElement)
  ],
  'botframework-webchat: <InjectStyleElementsComposer> supports injecting <link rel="stylesheet"> and <style> only'
);

type InjectedStylesElement = InferOutput<typeof injectedStylesElementSchema>;

const injectStyleElementsComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    styleElements: pipe(array(injectedStylesElementSchema), readonly())
  }),
  readonly()
);

type InjectStyleElementsComposerProps = InferOutput<typeof injectStyleElementsComposerPropsSchema>;

type InjectedStylesInstance = {
  readonly element: InjectedStylesElement;
  readonly mountingElement: InjectedStylesElement;
  readonly root: Node;
};

const sharedInstances: InjectedStylesInstance[] = [];

function InjectStyleElementsComposer(props: InjectStyleElementsComposerProps) {
  const { children, styleElements } = validateProps(injectStyleElementsComposerPropsSchema, props);

  const [{ stylesRoot: root }] = useStyleOptions();

  useEffect(() => {
    if (!root) {
      return;
    }

    const instancesToRemoveOnUnmount: InjectedStylesInstance[] = [];

    // TODO: [P2] Move to "toReversed()" once we updated Chrome >= 110 and Safari >= 16.
    for (const element of [...styleElements].reverse()) {
      let instance: InjectedStylesInstance | undefined = sharedInstances.find(
        instance => instance.element === element && instance.root === root
      );

      if (!instance) {
        const mountingElement = element.parentNode ? (element.cloneNode(true) as InjectedStylesElement) : element;

        instance = Object.freeze({
          element,
          // Deep clone is required for <style>body { ... }</style> (text node inside).
          mountingElement,
          root
        });

        mountingElement.hasAttribute('data-webchat-injected') ||
          mountingElement.setAttribute('data-webchat-injected', '');

        // When appending via useEffect(), the order of the useEffect() call will be from descendants to ancestors.
        // That means, the order will be reverse of what is in the React tree.
        // We are doing prepend instead of append, while keeping the first node the last one in the root element.

        // ```html
        // <InjectStyleElementsComposer styleElements={[stylesA1, stylesA2]}>
        //   <InjectStyleElementsComposer styleElements={[stylesB]} />
        // </InjectStyleElementsComposer>
        // ```

        // Will be injected in the following order to honor CSS cascading:

        // ```html
        // <head>
        //   <style>... stylesA1 ...</style>
        //   <style>... stylesA2 ...</style>
        //   <style>... stylesB ...</style>
        // </head>
        // ```

        const insertBeforeNode = Array.from(root.childNodes).find(
          child => child instanceof HTMLElement && child.hasAttribute('data-webchat-injected')
        );

        insertBeforeNode ? root.insertBefore(mountingElement, insertBeforeNode) : root.appendChild(mountingElement);
      }

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
  }, [root, styleElements]);

  return children;
}

InjectStyleElementsComposer.displayName = 'InjectStyleElementsComposer';

/**
 * When mounted, will inject `<link rel="stylesheet">` and `<style>` into DOM.
 *
 * The container to inject the elements is based on `styleOptions.stylesRoot`.
 */
export default memo(InjectStyleElementsComposer as FunctionComponent<InjectStyleElementsComposerProps>);
export { injectStyleElementsComposerPropsSchema, type InjectStyleElementsComposerProps };
