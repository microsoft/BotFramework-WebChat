type ContainerQuery = `@container ${string}`;
type MediaQuery = `@media ${string}`;
type SelfQuery = `&${string}`;
type CustomVariable = `--${string}`;

type StyleSet = {
  [key: ContainerQuery | MediaQuery | SelfQuery]: StyleSet;
  [key: CustomVariable]: string;
} & Partial<CSSStyleDeclaration>;

export { type ContainerQuery, type CustomVariable, type MediaQuery, type SelfQuery, type StyleSet };
