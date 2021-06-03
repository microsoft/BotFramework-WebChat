// Renderer middleware signature:
// (setup: SetupOptions) => (next: Enhancer) => (create: CreateOptions) => false | React.FC<ReactProps>

export type RendererCreator<TCreateOptions, TReactProps> = (
  options: TCreateOptions,
  ...extraArgs: any[]
) => React.FC<TReactProps> | false;

export type RendererEnhancer<TCreateOptions, TReactProps> = (
  next: RendererCreator<TCreateOptions, TReactProps>
) => RendererCreator<TCreateOptions, TReactProps>;

export type RendererMiddleware<TSetupOptions, TCreateOptions, TReactProps> = (
  options: TSetupOptions,
  ...extraArgs: any[]
) => RendererEnhancer<TCreateOptions, TReactProps>;
