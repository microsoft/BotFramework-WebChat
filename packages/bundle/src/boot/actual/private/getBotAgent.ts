import { type ReadonlyBuildInfo } from '@msinternal/botframework-webchat-base/utils';

export default function getBotAgent(buildInfo: ReadonlyBuildInfo): `WebChat/${string} (${string})` {
  switch (buildInfo.get('variant')) {
    case 'full':
      return `WebChat/${buildInfo.version} (Full)`;

    case 'full-es5':
      return `WebChat/${buildInfo.version} (ES5)`;

    case 'minimal':
      return `WebChat/${buildInfo.version} (Minimal)`;

    default:
      return `WebChat/${buildInfo.version} (Unknown)`;
  }
}
