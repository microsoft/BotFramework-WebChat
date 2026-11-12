import React, { memo, type ReactNode } from 'react';

import createSliceContext from './private/createSliceContext';

const [DictateInterimsContext, useDictateInterimsSlice] = createSliceContext<string[] | undefined>(
  'WebChatDictateInterimsContext'
);

const [DictateStateContext, useDictateStateSlice] = createSliceContext<number>('WebChatDictateStateContext');

const [ShouldSpeakIncomingActivityContext, useShouldSpeakIncomingActivitySlice] = createSliceContext<boolean>(
  'WebChatShouldSpeakIncomingActivityContext'
);

type SpeechSlicesProps = {
  readonly children?: ReactNode | undefined;
  readonly dictateInterims: string[] | undefined;
  readonly dictateState: number;
  readonly shouldSpeakIncomingActivity: boolean;
};

/**
 * The slices of the speech group: dictate interims, dictate state and should speak incoming activity, one context
 * each, so a hook re-renders only when its slice changes. Both provider sets render it, with the values of their state.
 */
function SpeechSlicesProvider({
  children,
  dictateInterims,
  dictateState,
  shouldSpeakIncomingActivity
}: SpeechSlicesProps) {
  return (
    <DictateInterimsContext.Provider value={dictateInterims}>
      <DictateStateContext.Provider value={dictateState}>
        <ShouldSpeakIncomingActivityContext.Provider value={shouldSpeakIncomingActivity}>
          {children}
        </ShouldSpeakIncomingActivityContext.Provider>
      </DictateStateContext.Provider>
    </DictateInterimsContext.Provider>
  );
}

SpeechSlicesProvider.displayName = 'SpeechSlicesProvider';

const SpeechSlices = memo(SpeechSlicesProvider);

export default SpeechSlices;
export { useDictateInterimsSlice, useDictateStateSlice, useShouldSpeakIncomingActivitySlice, type SpeechSlicesProps };
