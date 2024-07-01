// CSS modules
type CSSModuleClasses = { readonly [key: string]: any };

declare module '*.module.css' {
  const classes: CSSModuleClasses;
  export default classes;
}
