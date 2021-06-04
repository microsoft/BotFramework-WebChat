import useStyleOptions from './useStyleOptions';

export default function useGroupTimestamp(): [boolean] {
  const [{ groupTimestamp }] = useStyleOptions();

  return [groupTimestamp];
}
