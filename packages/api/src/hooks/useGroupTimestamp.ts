import useStyleOptions from './useStyleOptions';

export default function useGroupTimestamp(): [boolean | number] {
  const [{ groupTimestamp }] = useStyleOptions();

  return [groupTimestamp];
}
