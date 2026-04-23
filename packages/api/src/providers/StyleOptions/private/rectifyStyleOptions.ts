import type { StrictStyleOptions, StyleOptions } from '../../../StyleOptions';
import normalizeStyleOptions from '../../../normalizeStyleOptions';
import patchStyleOptionsFromDeprecatedProps from '../../../patchStyleOptionsFromDeprecatedProps';

export default function rectifyStyleOptions(styleOptions: StyleOptions): StrictStyleOptions {
  return normalizeStyleOptions(patchStyleOptionsFromDeprecatedProps(styleOptions));
}
