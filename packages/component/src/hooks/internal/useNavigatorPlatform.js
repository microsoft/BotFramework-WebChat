import { useMemo } from 'react';

const ANDROID_PATTERN = /^(android|linux armv7l)/giu;
const APPLE_PATTERN = /^(mac|ipad|iphone|ipod)/giu;
const LINUX_PATTERN = /^linux/giu;
const WINDOWS_PATTERN = /^win/giu;

export default function useNavigatorPlatform() {
  const {
    navigator: { platform }
  } = window;

  return useMemo(() => {
    // This list is very limited. Please use with care. Please refer to this link for details.
    // https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today

    const android = ANDROID_PATTERN.test(platform);
    const apple = APPLE_PATTERN.test(platform);
    const windows = WINDOWS_PATTERN.test(platform);

    const linux = !android && LINUX_PATTERN.test(platform);

    return [
      {
        android,
        apple,
        linux,
        windows
      }
    ];
  }, [platform]);
}
