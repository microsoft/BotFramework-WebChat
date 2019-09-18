import useStyleSet from './useStyleSet';

export default function useStyleOptions() {
  // Today, the "styleSet.options" is patched with missing values and "styleOptions" are unpatched.
  // Thus, we are using the "styleSet.options" version for now.

  return [useStyleSet()[0].options];
}
