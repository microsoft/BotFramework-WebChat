// Lightning CSS options and post-processing for CSS modules, shared by every bundler plugin that compiles them.
import { Buffer } from 'buffer';
import { transform } from 'lightningcss';
import { fileURLToPath, URL } from 'url';

// A CSS module rule without styles of its own keeps its class name (e.g. for themes) with this declaration:
// Lightning CSS drops empty rules, and their class names with them.
// Once the class map is built, the declaration, and the rule if it becomes empty, are removed from the CSS.
const PRESERVE_REASON_PROPERTY = '--webchat-preserve-reason';

// The class map that unplugin-lightningcss writes for a CSS module: `const classes = {…}` on one line, then one
// `const …\nexport { … }` block per class, separated by empty lines.
const CLASS_MAP_PATTERN = /^const classes = (\{.*\})$/mu;

const removePreserveReasonVisitor = Object.freeze({
  Declaration: Object.freeze({ custom: Object.freeze({ [PRESERVE_REASON_PROPERTY]: () => [] }) })
});

/**
 * Options of unplugin-lightningcss.
 *
 * @type { NonNullable<Parameters<typeof import('unplugin-lightningcss/rolldown').default>[0]> }
 */
const lightningCSSPluginOptions = Object.freeze({
  include: [/\.module\.css$/u],
  options: {
    cssModules: {
      pattern: 'w[hash]_[local]',
      pure: true,
      animation: false,
      grid: false,
      customIdents: false
    },
    // Hashed class names come from the file path relative to this folder (the repository root):
    // the same on every machine, and different for modules at the same path in different packages.
    projectRoot: fileURLToPath(new URL('.', import.meta.url))
  }
});

/**
 * Removes the preserve-reason declarations from the compiled CSS of a CSS module (`*.module_built.css`).
 *
 * @param {string} code
 * @param {string} filename
 * @returns {string}
 */
function removePreserveReason(code, filename) {
  return code.includes(PRESERVE_REASON_PROPERTY)
    ? transform({ code: Buffer.from(code), filename, visitor: removePreserveReasonVisitor }).code.toString()
    : code;
}

/**
 * Sorts the class map of a CSS module (`*.module.css?css_module`, from unplugin-lightningcss) by class name.
 *
 * Lightning CSS returns the classes in random order (a Rust `HashMap`), so two builds of the same files differ.
 * Remove once Lightning CSS keeps them in order (parcel-bundler/lightningcss#1355, after 1.33.0).
 *
 * @param {string} code
 * @param {string} filename
 * @returns {string}
 */
function sortClassMap(code, filename) {
  const [head = '', ...namedExports] = code.trimEnd().split('\n\n');
  const [line, json] = CLASS_MAP_PATTERN.exec(head) ?? [];

  if (!line || !json) {
    throw new Error(`Unknown class map format from unplugin-lightningcss in ${filename}.`);
  }

  // Class names are unique: never equal.
  const sorted = Object.fromEntries(Object.entries(JSON.parse(json)).sort(([x], [y]) => (x < y ? -1 : 1)));

  return `${[head.replace(line, () => `const classes = ${JSON.stringify(sorted)}`), ...namedExports.sort()].join('\n\n')}\n`;
}

export { lightningCSSPluginOptions, removePreserveReason, sortClassMap };
