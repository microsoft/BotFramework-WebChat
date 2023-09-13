import { createChainOfResponsibility, type ComponentMiddleware } from 'react-chain-of-responsibility';
import React, { memo, type ReactNode, useMemo, useState } from 'react';

import { type InputModalityMiddleware } from './types/InputModalityMiddleware';
import { type InputModalityRequest } from './types/InputModalityRequest';
import Context from './private/Context';
import createSpeechInputMiddleware from './SpeechInput/createMiddleware';
import createTextInputMiddleware from './TextInput/createMiddleware';

type Props = {
  // eslint-disable-next-line react/require-default-props
  children?: ReactNode;
  // eslint-disable-next-line react/require-default-props
  middleware?: ComponentMiddleware<InputModalityRequest>[];
};

const InputModalityProvider = memo(({ children, middleware }: Props) => {
  const [type, setType] = useState<string | undefined>();
  const { Provider, Proxy } = createChainOfResponsibility<InputModalityRequest>();

  const proxyComponentState = Object.freeze([Proxy] as const);
  const typeState = Object.freeze([type, setType] as const);

  const mergedMiddleware = useMemo<InputModalityMiddleware[]>(
    () => [...(middleware || []), createSpeechInputMiddleware(), createTextInputMiddleware()],
    [middleware]
  );

  const context = useMemo(() => ({ proxyComponentState, typeState }), [proxyComponentState, typeState]);

  return (
    <Context.Provider value={context}>
      <Provider middleware={mergedMiddleware}>{children}</Provider>
    </Context.Provider>
  );
});

export default InputModalityProvider;
