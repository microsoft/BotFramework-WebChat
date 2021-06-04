import LocalizedStrings from '../types/LocalizedStrings';

export default function mergeLocalizedStrings(...args: string[][]): { [language: string]: LocalizedStrings } {
  const merged = {};
  const languages = args.reduce((keys, arg) => [...keys, ...Object.keys(arg)], []);

  for (const language of new Set(languages)) {
    merged[language] = args.reduce((merged, arg) => ({ ...merged, ...arg[language] }), {});
  }

  return merged;
}
