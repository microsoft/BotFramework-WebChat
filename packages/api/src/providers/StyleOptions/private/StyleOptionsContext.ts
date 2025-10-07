import { defaultStyleOptions, type StrictStyleOptions } from 'botframework-webchat-api';
import { createContext, useContext } from 'react';

import rectifyStyleOptions from './rectifyStyleOptions';

type StyleOptionsContextType = {
  readonly styleOptionsState: readonly [Readonly<StrictStyleOptions>];
};

const StyleOptionsContext = createContext<StyleOptionsContextType>({
  styleOptionsState: Object.freeze([rectifyStyleOptions(defaultStyleOptions)])
});

StyleOptionsContext.displayName = 'StyleOptionsContext';

const useStyleOptionsContext = (): StyleOptionsContextType => useContext(StyleOptionsContext);

export default StyleOptionsContext;
export { useStyleOptionsContext, type StyleOptionsContextType };
