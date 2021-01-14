import { hooks } from 'botframework-webchat-api';

const { useStyleOptions } = hooks;
// Subset of landmark roles: https://w3.org/TR/wai-aria/#landmark_roles
const ARIA_LANDMARK_ROLE_RE = /^(complementary|contentinfo|form|main|region)$/u;
const DEFAULT_ROLE = 'complementary';

export function checkValidAriaLandmarkRole(roleName) {
  if (!roleName) {
    return DEFAULT_ROLE;
  }

  if (typeof roleName !== 'string' || !ARIA_LANDMARK_ROLE_RE.test(roleName)) {
    throw new Error('botframework-webchat: "containerRole" in "styleOptions" must be a valid WAI-ARIA landmark role.');
  }
  return roleName;
}

export default function useContainerRole() {
  const [options] = useStyleOptions();
  const { containerRole } = options;

  return checkValidAriaLandmarkRole(containerRole);
}
