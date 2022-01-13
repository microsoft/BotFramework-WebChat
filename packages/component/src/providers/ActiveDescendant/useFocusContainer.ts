import useActiveDescendantContext from './private/useContext';

export default function useFocusContainer(): () => void {
  const { focusContainer } = useActiveDescendantContext();

  return focusContainer;
}
