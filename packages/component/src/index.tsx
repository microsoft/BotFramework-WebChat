import { FC } from 'react';
import { StyleOptions } from 'botframework-webchat-api';

type Expando<T> = Omit<any, keyof T> & T;

/** Creates a set of styles */
// eslint-disable-next-line no-unused-vars
declare function createStyleSet(styleOptions: StyleOptions): any;

type ComposerProps = {
  /** Text directionality */
  dir?: 'ltr' | 'rtl' | 'auto';

  /** Style options */
  styleOptions?: StyleOptions;
};

type ReactWebChatProps = {
  /** Text directionality */
  dir?: 'ltr' | 'rtl' | 'auto';

  /** Style options */
  styleOptions?: StyleOptions;
};

/** React-based Web Chat */
declare const ReactWebChat: FC<Expando<ReactWebChatProps>>;

declare const Components: Expando<{
  Composer: FC<Expando<ComposerProps>>;
}>;

export default ReactWebChat;
export { Components, createStyleSet };
export type { ComposerProps, ReactWebChatProps };
