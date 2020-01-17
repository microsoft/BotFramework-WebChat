import useDetermineDirection from './internal/useDeterminedDirection';

export default function useDirection(dir) {
  const determinedDirection = useDetermineDirection(dir);

  return [determinedDirection];
}
