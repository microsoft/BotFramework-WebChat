declare global {
  namespace JSX {
    interface IntrinsicElements {
      'focus-trap': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { onescapekeydown?: () => void },
        HTMLElement
      >;
    }
  }
}

export {};
