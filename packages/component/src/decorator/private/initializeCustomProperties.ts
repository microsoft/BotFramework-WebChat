/* eslint-disable no-magic-numbers */
export default function initializeCustomProperties() {
  try {
    CSS.registerProperty({
      // Radians!
      name: '--webchat-borderFlair-animated-angle',
      syntax: '<number>',
      inherits: true,
      initialValue: String((3 * Math.PI) / 4)
    });
    CSS.registerProperty({
      name: '--webchat-borderFlair-animated-color1',
      syntax: '<color>',
      inherits: true,
      initialValue: 'transparent'
    });
    CSS.registerProperty({
      name: '--webchat-borderFlair-animated-color2',
      syntax: '<color>',
      inherits: true,
      initialValue: 'transparent'
    });
    CSS.registerProperty({
      name: '--webchat-borderFlair-animated-color3',
      syntax: '<color>',
      inherits: true,
      initialValue: 'transparent'
    });
  } catch (e) {
    // This can only be called once and things like hot module replacement
    // can trigger it multiple times. Discard errors.
  }
}
