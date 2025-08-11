export default () => ({
  '*:has(> &.webchat__tooltip)': {
    position: 'relative',

    // For <button>, the tooltip will be placed inside <button>.
    // For <input type="checkbox/radio">, the tooltip will be placed after <input>.
    '&:is(:hover, :focus-visible, :active) > .webchat__tooltip, &:has(:is(:hover, :focus-visible, :active)) > .webchat__tooltip':
      {
        opacity: 1,
        transitionDelay: '400ms'
      }
  },

  '&.webchat__tooltip': {
    '--webchat__tooltip-tip-size': '8.484px',
    '--webchat__tooltip-background': '#fff',
    '--webchat__tooltip-anchor-inline-start': '50%',

    background: 'var(--webchat__tooltip-background)',
    borderRadius: '4px',
    color: '#242424',
    filter: `drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.14)) drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.12))`,
    fontSize: '12px',
    inlineSize: 'max-content',
    isolation: 'isolate',
    lineHeight: '16px',
    margin: 0,
    maxInlineSize: '30ch',
    opacity: 0,
    padding: '6px 12px',
    pointerEvents: 'none',
    position: 'absolute',
    textAlign: 'start',
    transition: 'opacity 0.2s ease',
    userSelect: 'none',
    willChange: 'filter',

    '&::after': {
      background: 'inherit',
      color: 'currentColor',
      content: `""`,
      inset: 0,
      position: 'absolute'
    },

    '&.webchat__tooltip--block-start, &.webchat__tooltip--block-end': {
      textAlign: 'center'
    },

    '&.webchat__tooltip--block-start': {
      insetBlockEnd: 'calc(100% + 7px)',
      insetInlineStart: '50%',
      transform: 'translate(calc(-1 * var(--webchat__tooltip-anchor-inline-start)), 0)',
      '&::after': {
        border: '1px solid var(--webchat__tooltip-background)',
        borderBottomLeftRadius: '2px',
        clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
        height: 'var(--webchat__tooltip-tip-size)',
        insetBlockStart: 'calc(100% - 6px)',
        insetInlineStart: 'calc(var(--webchat__tooltip-anchor-inline-start) - var(--webchat__tooltip-tip-size) / 2)',
        transform: 'rotate(-45deg)',
        width: 'var(--webchat__tooltip-tip-size)'
      }
    }
  }
});
