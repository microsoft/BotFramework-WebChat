import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

const { useLocalizer } = hooks;

// Names and aliases follow Shiki ("bundledLanguagesInfo" in "shiki/langs"). Aliases are in lowercase.
const STRING_ID_BY_PROGRAMMING_LANGUAGE: ReadonlyMap<string, string> = Object.freeze(
  new Map(
    Object.entries({
      PROGRAMMING_LANGUAGE_C: ['c'],
      PROGRAMMING_LANGUAGE_CPP: ['c++', 'cpp'],
      PROGRAMMING_LANGUAGE_CSHARP: ['c#', 'cs', 'csharp'],
      PROGRAMMING_LANGUAGE_CSS: ['css'],
      PROGRAMMING_LANGUAGE_GO: ['go'],
      PROGRAMMING_LANGUAGE_HTML: ['html'],
      PROGRAMMING_LANGUAGE_JAVA: ['java'],
      PROGRAMMING_LANGUAGE_JAVASCRIPT: ['javascript', 'js'],
      PROGRAMMING_LANGUAGE_JSON: ['json'],
      PROGRAMMING_LANGUAGE_JSX: ['jsx'],
      PROGRAMMING_LANGUAGE_KOTLIN: ['kotlin', 'kt', 'kts'],
      PROGRAMMING_LANGUAGE_MARKDOWN: ['markdown', 'md'],
      PROGRAMMING_LANGUAGE_PHP: ['php'],
      PROGRAMMING_LANGUAGE_POWERSHELL: ['powershell', 'ps', 'ps1'],
      PROGRAMMING_LANGUAGE_PYTHON: ['py', 'python'],
      PROGRAMMING_LANGUAGE_RUBY: ['rb', 'ruby'],
      PROGRAMMING_LANGUAGE_RUST: ['rs', 'rust'],
      PROGRAMMING_LANGUAGE_SHELL: ['bash', 'sh', 'shell', 'shellscript', 'zsh'],
      PROGRAMMING_LANGUAGE_SQL: ['sql'],
      PROGRAMMING_LANGUAGE_SWIFT: ['swift'],
      PROGRAMMING_LANGUAGE_TSX: ['tsx'],
      PROGRAMMING_LANGUAGE_TYPESCRIPT: ['ts', 'typescript'],
      PROGRAMMING_LANGUAGE_XML: ['xml'],
      PROGRAMMING_LANGUAGE_YAML: ['yaml', 'yml']
    }).flatMap(([stringId, aliases]) => aliases.map(alias => [alias, stringId] as const))
  )
);

/**
 * Returns a function to get the title of a programming language, e.g. "JavaScript" for "javascript" or "js".
 *
 * Titles of known programming languages are localizable strings, which can be overridden via `overrideLocalizedStrings`.
 * For other programming languages, the first letter is capitalized.
 */
export default function useLocalizeProgrammingLanguage(): (language: string | undefined) => string | undefined {
  const localize = useLocalizer();

  return useCallback(
    (language: string | undefined) => {
      const stringId = language && STRING_ID_BY_PROGRAMMING_LANGUAGE.get(language.toLowerCase());

      return stringId ? localize(stringId) : language && language.charAt(0).toUpperCase() + language.slice(1);
    },
    [localize]
  );
}
