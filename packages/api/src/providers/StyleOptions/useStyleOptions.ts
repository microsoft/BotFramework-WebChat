import { type StrictStyleOptions } from '../../StyleOptions';
import { useStyleOptionsContext } from './private/StyleOptionsContext';

export default function useStyleOptions(): readonly [StrictStyleOptions] {
  return useStyleOptionsContext().styleOptionsState;
}
