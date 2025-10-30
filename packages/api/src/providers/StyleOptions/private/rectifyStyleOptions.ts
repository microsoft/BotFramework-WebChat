import { type StrictStyleOptions, type StyleOptions } from 'botframework-webchat-api';

import normalizeStyleOptions from '../../../normalizeStyleOptions';
import patchStyleOptionsFromDeprecatedProps from '../../../patchStyleOptionsFromDeprecatedProps';

export default function rectifyStyleOptions(styleOptions: StyleOptions): StrictStyleOptions {
  return normalizeStyleOptions(patchStyleOptionsFromDeprecatedProps(styleOptions));
}
