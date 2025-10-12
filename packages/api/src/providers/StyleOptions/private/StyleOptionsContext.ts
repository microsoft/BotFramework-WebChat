import { createContext, useContext } from 'react';

import defaultStyleOptions from '../../../defaultStyleOptions';
import { type StrictStyleOptions } from '../../../StyleOptions';
import rectifyStyleOptions from './rectifyStyleOptions';

type StyleOptionsContextType = {
  readonly styleOptionsState: readonly [Readonly<StrictStyleOptions>];
};

const StyleOptionsContext = createContext<StyleOptionsContextType>({
  styleOptionsState: Object.freeze([rectifyStyleOptions(defaultStyleOptions)])
});

StyleOptionsContext.displayName = 'StyleOptionsContext';

const useStyleOptionsContext = () => useContext(StyleOptionsContext);

export default StyleOptionsContext;
export { useStyleOptionsContext, type StyleOptionsContextType };
