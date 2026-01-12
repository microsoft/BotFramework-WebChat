/* eslint-env node */
/* eslint-disable complexity */
/* eslint-disable no-console */

import sg from '@ast-grep/napi';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const parseAllToJSON = yamlContent => YAML.parseAllDocuments(yamlContent).map(doc => doc.toJSON());

export const description = 'Verify one or more files using an AST-Grep preset.';

export function help() {
  console.log(`Usage: vg ast-check <preset> <files...>

${description}

Arguments:
  <preset>   Name of the preset to use. Presets are located in the "rules"
             directory next to this script and can be YAML or JS files.
  <files...> One or more files to verify. Shell glob expansion happens
             outside this tool, so pass files directly.
`);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const rules = fs
    .readdirSync(path.resolve(dirname, '../rules'))
    .filter(file => file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.js'));

  console.log('Available presets:');
  for (const rule of rules) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const rulesContent = fs.readFileSync(path.resolve(dirname, '../rules', rule), 'utf-8');

    const rules = parseAllToJSON(rulesContent);
    const ruleName = rule.replace(/\.ya?ml$/u, '').replace(/\.js$/u, '');

    console.log(`\n  Preset: ${ruleName}`);

    for (const ruleData of rules) {
      console.log(`    ${ruleData.id || '(unnamed)'} - ${ruleData.description || 'No description provided.'}`);
      if (ruleData.args && Array.isArray(ruleData.args)) {
        console.log(`      Example: vg ast-check ${ruleName} ${ruleData.args.join(' ')}`);
      }
    }
  }
}

export default async function run(...args) {
  if (args.length === 0) {
    console.error('Error: no preset specified for ast-check command.');
    help();
    return;
  }
  const preset = args.shift();
  const files = args;
  if (files.length === 0) {
    console.error('Error: no files provided for ast-check command.');
    help();
    return;
  }
  // Resolve the preset file.
  const presetDir = path.resolve(dirname, '..', 'rules');
  const extensions = ['.yaml', '.yml', '.js'];
  let presetPath = null;
  for (const ext of extensions) {
    const candidate = path.join(presetDir, `${preset}${ext}`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(candidate)) {
      presetPath = candidate;
      break;
    }
  }
  if (!presetPath) {
    console.error(`Error: preset '${preset}' not found in ${presetDir}.`);
    return;
  }
  // Handle JS presets by invoking their exported function.
  if (presetPath.endsWith('.js')) {
    const { default: mod } = await import(presetPath);
    const handler = typeof mod === 'function' ? mod : mod.default;
    if (typeof handler !== 'function') {
      console.error(`Error: JS preset ${presetPath} does not export a function.`);
      return;
    }
    await handler({ files, args });
    return;
  }
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const yamlContent = fs.readFileSync(presetPath, 'utf-8');
  // A YAML file may contain multiple documents separated by ---.
  const documents = parseAllToJSON(yamlContent);
  let hasViolation = false;
  for (const file of files) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!fs.existsSync(file)) {
      console.warn(`Warning: file ${file} does not exist.  Skipping.`);
      continue;
    }
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const source = fs.readFileSync(file, 'utf-8');
    let root, lang;
    for (const rule of documents) {
      if (lang !== rule.language) {
        root = lang = undefined;
      }
      lang = lang || rule.language;
      root = root || sg.parse(sg.Lang[rule.language], source).root();
      if (!rule || typeof rule !== 'object' || !rule.rule) {
        console.warn(`Warning: invalid rule in preset ${presetPath}.  Skipping rule.`);
        continue;
      }

      const id = rule.id || '(unnamed rule)';
      const isFatalRule = ['error', 'warning'].includes(rule?.severity);

      if ('severity' in rule && !isFatalRule) {
        console.warn(`Warning: rule ${id} severity '${rule.severity}' is not recognized.  Use 'error' or 'warning'.`);
      }

      const matcher = { rule: rule.rule };
      if (rule.constraints) {
        matcher.constraints = rule.constraints;
      }
      // Perform structural search using ast-grep's JS API.
      const matches = root.findAll(matcher);
      if (matches.length > 0) {
        hasViolation = isFatalRule || hasViolation;
        console.error(
          `${isFatalRule ? '🔴 FAIL' : '🟡 SKIP'} ${file}: found ${matches.length} violation(s) for rule '${id}'.`
        );
        // Print custom message from the rule if provided.
        if (rule.message) {
          console.error(`   ${rule.severity || 'note'}: ${rule.message}`);
        }
        try {
          const lines = matches.map(node => {
            const rng = node.range();
            return rng.start.line + 1;
          });
          if (lines.length > 0) {
            const unique = Array.from(new Set(lines));
            for (const line of unique) {
              console.error(`      ${file}:${line}`);
            }
          }
        } catch (e) {
          console.error(`      ${file}: <unable to determine line numbers>`);
        }
      } else {
        console.log(`🟢 PASS ${file}: ${id}.`);
      }
    }
  }
  process.exit(hasViolation ? 1 : 0);
}
