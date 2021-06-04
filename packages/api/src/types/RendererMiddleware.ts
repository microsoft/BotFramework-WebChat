// TODO: Rename to ComponentMiddleware.

/**
 * Renders a UI component by returning a React component, or `false`, if nothing should be rendered.
 *
 * @returns {(React.FC|false)} Returns a React component to render, or `false`, if nothing should be rendered.
 */
export type RendererCreator<TCreateOptions, TReactProps> = (
  options?: TCreateOptions,
  ...extraArgs: any[]
) => React.FC<TReactProps> | false;

/**
 * Enhances a UI component through decoration, replacement, or removal.
 */
export type RendererEnhancer<TCreateOptions, TReactProps> = (
  next: RendererCreator<TCreateOptions, TReactProps>
) => RendererCreator<TCreateOptions, TReactProps>;

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
 * (setup?: SetupOptions) => (next: Enhancer) => (create?: CreateOptions) => false | React.FC<ReactProps>
 * ```
 */
export type RendererMiddleware<TSetupOptions, TCreateOptions, TReactProps> = (
  options?: TSetupOptions,
  ...extraArgs: any[]
) => RendererEnhancer<TCreateOptions, TReactProps>;
