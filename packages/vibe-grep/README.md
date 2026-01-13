# Vibe-Grep (vg)

An internal tool for repository housekeeping using AST-based code search and analysis.

## Usage

The tool is available across the repo via the `vg` command:

```bash
vg help
```

## Architecture

Built on top of [`ast-grep`](https://ast-grep.github.io/), vibe-grep provides extensible code analysis through:

- **Commands** – Custom operations in the `commands/` folder
- **Presets** – Reusable rule sets in the `rules/` folder
- **Rules** – Individual AST patterns within presets

## Development

### Adding Commands

Create a `.js` file in the `commands/` directory:

```js
export const description = 'Short command description.';

export function help(...args) {
   // Print command help (optional)
}

export default function run(...args) {
   // Run the command
}
```

### Adding Presets

Debug rules using the [AST-Grep playground](https://ast-grep.github.io/playground.html).

Create a `.yaml` file in the `rules/` directory:

```yaml
---
# Context for developers

id: rule-name
language: TypeScript # or JavaScript, etc.
rule:
   # AST pattern goes here
description: 'Rule description for help command'
message: 'Message shown when matched'
severity: error # or warning
args: [sample, args] # For help examples
```

### Adding Rules

Adding new rules to existing presets is as simple as adding another block starting from `---` into the desired `.yaml` file.

## License

MIT
