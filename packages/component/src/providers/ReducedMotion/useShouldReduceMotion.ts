import useContext from './private/useContext';

export default function useShouldReduceMotion(): ReturnType<typeof useContext>['shouldReduceMotionState'] {
  return useContext().shouldReduceMotionState;
}
