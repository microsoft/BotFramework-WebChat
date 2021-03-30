import { FC } from 'react';
import { ComposerProps, ReactWebChatProps } from 'botframework-webchat-component';

import StyleOptions from './FullBundleStyleOptions';

type Replace<T1, T2> = Omit<T1, keyof T2> & T2;

/** Creates a set of styles with support of Adaptive Cards */
declare function createStyleSet(styleOptions: StyleOptions): any;

declare const Components: {
  Composer: FC<
    Replace<
      ComposerProps,
      {
        /** Style options with support of Adaptive Cards */
        styleOptions?: StyleOptions;
      }
    >
  >;
};

/** React-based Web Chat with support of Adaptive Cards */
declare const ReactWebChat: FC<
  Replace<
    ReactWebChatProps,
    {
      /** Style options with support of Adaptive Cards */
      styleOptions?: StyleOptions;
    }
  >
>;

export default ReactWebChat;
export { Components, createStyleSet };
export type { StyleOptions };

// Doc:
// - We don't want to export the whole index.ts, we just want to export what the user actually needed
//   - That's why we only exporting index.tsx (we cannot name it index.d.ts because TSC won't pick it up)
// - Changing between full bundle and minimal should be very smooth
//   - That's why we name both StyleOptions the same
//   - To use minimal, import 'botframework-webchat/lib/index-minimal';
// - Declarations need to be emitted to /lib/*.d.ts for code-splitting purpose
//   - import 'botframework-webchat/lib/index-minimal' should see IntelliSense support
