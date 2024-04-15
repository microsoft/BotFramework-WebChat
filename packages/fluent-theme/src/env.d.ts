// CSS modules
type CSSModuleClasses<Key = string> = { readonly [key: Key]: string };

declare module '*.module.css' {
  const classes: CSSModuleClasses;
  export default classes;
}
