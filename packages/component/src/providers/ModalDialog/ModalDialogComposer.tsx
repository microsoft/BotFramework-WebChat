import React, { memo, type ReactNode, useCallback, useMemo, useState } from 'react';

import Context from './private/Context';
import ModalDialog from './private/Popover';

import { type ContextOf } from '../../types/ContextOf';

type ContextType = ContextOf<typeof Context>;
type RenderFunction = Parameters<ContextType['showModal']>[0];
type DialogInit = Exclude<Parameters<ContextType['showModal']>[1], undefined>;

type RenderFunctionAndDialogInit = Readonly<[RenderFunction, DialogInit | undefined]>;

type Props = Readonly<{ children?: ReactNode }>;

const ModalDialogComposer = memo(({ children }: Props) => {
  const [renderFunctionAndDialogInit, setRenderFunctionAndDialogInit] = useState<
    RenderFunctionAndDialogInit | undefined
  >();

  const close = useCallback(() => setRenderFunctionAndDialogInit(undefined), [setRenderFunctionAndDialogInit]);
  const showModal = useCallback<(render: RenderFunction, init?: DialogInit) => void>(
    (render: RenderFunction, init?: DialogInit) => setRenderFunctionAndDialogInit(Object.freeze([render, init])),
    [setRenderFunctionAndDialogInit]
  );

  const context = useMemo<ContextType>(() => Object.freeze({ close, showModal }), [close, showModal]);

  return (
    <Context.Provider value={context}>
      {children}
      {renderFunctionAndDialogInit && (
        <ModalDialog
          aria-label={renderFunctionAndDialogInit[1]?.['aria-label']}
          aria-labelledby={renderFunctionAndDialogInit[1]?.['aria-labelledby']}
          className={renderFunctionAndDialogInit[1]?.className}
          onDismiss={close}
        >
          {renderFunctionAndDialogInit[0]()}
        </ModalDialog>
      )}
    </Context.Provider>
  );
});

ModalDialogComposer.displayName = 'ModalDialogComposer';

export default ModalDialogComposer;
