import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Fragment, memo, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { instance, nullable, object, optional, pipe, readonly } from 'valibot';

import refObject from '../../types/internal/refObject';
import { type CustomElementPortal } from './private/CustomElementPortalRegistry';
import useCustomElementsContext from './private/useCustomElementsContext';

const customElementPortalScopePropsSchema = pipe(
  object({
    containerRef: optional(refObject(optional(nullable(instance(HTMLElement)))))
  }),
  readonly()
);

type CustomElementPortalScopeProps = InferReactProps<typeof customElementPortalScopePropsSchema>;

const EMPTY_PORTALS: readonly CustomElementPortal[] = Object.freeze([]);

/**
 * Renders the content of Web Chat custom elements inside the container, or all others when there is no container.
 *
 * React events from these elements propagate to the React ancestors of this component, as DOM events propagate to the container.
 */
function CustomElementPortalScope(props: CustomElementPortalScopeProps) {
  const { containerRef } = validateProps(customElementPortalScopePropsSchema, props);

  const [portals, setPortals] = useState<readonly CustomElementPortal[]>(EMPTY_PORTALS);
  const { portalRegistry } = useCustomElementsContext();

  // Observe before the custom elements, which are connected in the same commit, are rendered.
  useLayoutEffect(() => portalRegistry.observe(setPortals, containerRef), [containerRef, portalRegistry]);

  return (
    <Fragment>
      {portals.map(({ component: Component, element, key, props: componentProps }) => (
        // Preact's `createPortal()` has no `key` argument.
        <Fragment key={key}>{createPortal(<Component {...componentProps} />, element)}</Fragment>
      ))}
    </Fragment>
  );
}

CustomElementPortalScope.displayName = 'CustomElementPortalScope';

export default memo(CustomElementPortalScope);
export { customElementPortalScopePropsSchema, type CustomElementPortalScopeProps };
