import useContext from './private/useContext';

export default function useType(): readonly [string, (type: string) => void] {
  return useContext().typeState;
}
