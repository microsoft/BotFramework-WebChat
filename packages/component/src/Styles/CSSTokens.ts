import CustomPropertyNames from './CustomPropertyNames';

type CustomPropertyNamesType = typeof CustomPropertyNames;

type CSSTokensType<T extends Readonly<Record<string, string>>> = {
  [K in keyof T]: `var(${T[K]})`;
};

// To add/remove/update a token, go to `CustomPropertyName.ts`.
const CSSTokens = new Proxy(
  {},
  {
    get(_, key: keyof CustomPropertyNamesType) {
      // We already checked in the `CustomPropertyName`.
      // eslint-disable-next-line security/detect-object-injection
      return `var(${CustomPropertyNames[key]})`;
    }
  }
) as CSSTokensType<CustomPropertyNamesType>;

export default CSSTokens;
