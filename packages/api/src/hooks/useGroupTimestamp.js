import useStyleOptions from './useStyleOptions';

export default function useGroupTimestamp() {
  const [{ groupTimestamp }] = useStyleOptions();

  return [groupTimestamp];
}
