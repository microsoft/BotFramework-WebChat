import useContext from './private/useContext';

export default function useClose(): ReturnType<typeof useContext>['close'] {
  return useContext().close;
}
