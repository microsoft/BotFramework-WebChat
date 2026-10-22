import { createContext } from 'react';

export type HTMLContentTransformRequest = Readonly<{
  allowedTags: ReadonlyMap<
    string,
    Readonly<{
      // TODO: Ultimately, we could allowlist a cherry-picked instance of element, but not all elements sharing the same tag name.
      attributes: ReadonlySet<string>;
    }>
  >;
  codeBlockTagName: string;
  documentFragment: DocumentFragment;
  externalLinkAlt: string;
}>;

export type HTMLContentTransformFunction = (request: HTMLContentTransformRequest) => DocumentFragment;

export type HTMLContentTransformEnhancer = (next: HTMLContentTransformFunction) => HTMLContentTransformFunction;

export type HTMLContentTransformMiddleware = () => HTMLContentTransformEnhancer;

export type HTMLContentTransformContextType = Readonly<{
  transform: HTMLContentTransformFunction;
}>;

const HTMLContentTransformContext = createContext<HTMLContentTransformContextType>(
  new Proxy({} as HTMLContentTransformContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <HTMLContentTransformComposer>.');
    }
  })
);

export default HTMLContentTransformContext;
