import { ReactNode } from 'react';

type OnScreenReactNode = Exclude<ReactNode, boolean | null | undefined>;

/**
 * Renders a UI component by returning a React component, or `false`, if nothing should be rendered.
 *
 * @returns {(React.FC|false)} Returns a React component to render, or `false`, if nothing should be rendered.
 */
type ComponentFactory<TComponentFactoryArguments extends any[], TProps> = (
  ...args: TComponentFactoryArguments
) => ((props?: TProps) => OnScreenReactNode) | false;

/**
 * Enhances a UI component through decoration, replacement, or removal.
 */
type ComponentEnhancer<TComponentFactoryArguments extends any[], TProps> = (
  next: ComponentFactory<TComponentFactoryArguments, TProps>
) => ComponentFactory<TComponentFactoryArguments, TProps>;

/**
 * Middleware for rendering a UI component.
 *
 * The middleware is a series of enhancers that are chained through functional composition. Each enhancer can:
 *
 * - Decorate: call the next enhancer to get its React component, then decorate it through UI composition
 * - Replace: return a React component without calling the next enhancer
 * - Remove: return `false` without calling the next enhancer
 *
 * The signature of the middleware is:
 *
 * ```
 * (...args: SetupArguments) => (next: Enhancer) => (...args: ComponentFactoryArguments) => false | React.FC<Props>
 * ```
 */
type ComponentMiddleware<TSetupArguments extends any[], TComponentFactoryArguments extends any[], TProps> = (
  ...args: TSetupArguments
) => ComponentEnhancer<TComponentFactoryArguments, TProps>;

export default ComponentMiddleware;

export { ComponentEnhancer, ComponentFactory };
