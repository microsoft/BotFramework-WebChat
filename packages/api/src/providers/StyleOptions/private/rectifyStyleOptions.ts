import type { StrictStyleOptions, default as StyleOptions } from '../../../StyleOptions';
import normalizeStyleOptions from '../../../normalizeStyleOptions';
import patchStyleOptionsFromDeprecatedProps from '../../../patchStyleOptionsFromDeprecatedProps';

export default function rectifyStyleOptions(styleOptions: StyleOptions): StrictStyleOptions {
  return normalizeStyleOptions(patchStyleOptionsFromDeprecatedProps(styleOptions));
}
