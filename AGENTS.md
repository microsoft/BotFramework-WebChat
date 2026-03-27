# AGENTS.md for Bot Framework Web Chat

## Coding

### General

- Read `docs/CONTRIBUTING.md` for details on setting up the repository for development
- Unless stated otherwise, avoid Node.js
- Apply our latest coding style to every file changed
- Avoid spaghetti code: on new feature with a similar existing feature, refactor existing one before writing new feature
   - This does not applies to test code
- Avoid global pollution, do not modify `window` object
- Markdown are always space-indented with 3 spaces
- Use `/prettierrc.yml` to format
- Sort names in property bags
- Avoid one-use variable, inline them instead
- More new lines to separate code with different responsibilities
   - Multiple lines of code that can run in random order, put them into a group, no need new line between them
   - Otherwise, lines of code that depends on each other in a specific order, separate them with new line
- Prefer `&&` over if-statement if it is a oneliner
- Importing relative file should always include file extension
- Prefer truthy/false check like `!array.length` over `array.length === 0`
- Prefer `numValue` over `valueCount` for "how many values are there"
- Prefer uppercase for acronyms instead of Pascal case, e.g. `getURL()` over `getUrl()`
   - The only exception is `id`, e.g. `getId()` over `getID()`
- Use fewer shorthands, only allow `min`, `max`, `num`
- All new/changed production code must have test cases, look at `__tests__/html2/**`
- Code coverage for new/changed code should reach 80%
- Deprecation notes should mark the date as 2 years from now

### Design

- Use immutability as much as possible, add `object.freeze()`
- Follow W3C convention for API design
   - Extends `EventTarget` when eventing is needed, do not use Node.js `on`/`off`
   - Consider `IntersectionObserver`-like pattern for allow userland to subscribe to live changes
- Allow ESNext code that is polyfilled by `core-js-pure` or `iter-fest` package

### Typing

- TypeScript is best-effort checking, use `valibot` for strict type checking
- Use `valibot` for runtime type checker, never use `zod`
   - Assume all externally exported functions will receive unsafe/invalid input, always check with `valibot`
- Avoid `any`
- Avoid `as`, use `valibot` instead
   - If absolutely needed, use `satisifes X as Y` to make sure it is `X` before force casting to `Y`
- Use as few `unknown` as possible
- All optional properties must be `undefined`-able, i.e. use `value?: number | undefined` over `value?: number`
- For functions exported outside of current file, make sure all arguments and return value are typed
- If need to look inside the object to check for types, use `valibot`
   - E.g. `if (obj && typeof obj === 'object' && 'value' in obj && typeof obj.value === 'string')` should be replaced with `safeParse(object({ value: string }), obj).success`
- Use `{ readonly value: string }` instead of `Readonly<{ value: string }>`
- Use as much `readonly` as possible

### React

- Always add `displayName`

Follow the template below.

```tsx
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React from 'react';
import { number, object, pipe, readonly } from 'valibot';

// Use valibot to validate props.
const MyComponentPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type MyComponentProps = InferInput<typeof MyComponentPropsSchema>;

// Use big function instead of arrow function.
function MyComponent(props: MyComponentProps) {
  // Call `validateProps` to get a validated props.
  const { children } = validateProps(MyComponentPropsSchema, props);

  // Use `<>` instead of `<Fragment>`.
  // Never export `children` by itself, always wrap with `<>`.
  return <>{children}</>;
}

// Set `displayName`.
MyComponent.displayName = 'MyComponent';

// Export as memoized/exotic component, export as default.
export default memo(MyComponent);

// Export both schema and typing.
export { MyComponentPropsSchema, type MyComponentProps };
```

## Testing instructions

- Practice test-driven development
- Build and run Docker to host WebDriver-controlled browser instances
   - Build container by `docker compose -f docker-compose-wsl2.yml build --build-arg REGISTRY=mcr.microsoft.com`
   - Start container by `docker compose -f docker-compose-wsl2.yml up --detach --scale chrome=2`
- Run `curl http://localhost:4444/wd/hub/status` and wait until `.value.ready` become `true`
- Run `npm test`, or `npm test -- --testPathPattern test-html-file.html` to focus on one
- Test files are HTML files under `/__tests__/html2/`, they are not JS
- Follow other HTML files under the same folder on how to write tests
- Page conditions, page elements, and page objects can be found at `/packages/test/page-object/src/globals`
- Use `expect` instead of `assert`
- Use `@testduet/given-when-then` package instead of xUnit style `describe`/`before`/`test`/`after`
- Prefer integration/end-to-end testing than unit testing
- Use as realistic setup as possible, such as using `msw` than mocking calls
- MUST NOT modify/update any existing snapshots, let human review the test failures, they could be failing legitimately
- MUST NOT use `-u` to update snapshots, delete the snapshots and rerun `npm test` instead

## PR instructions

- Run new test and all of them must be green
- Run `npm run precommit` to make sure it pass all linting process
- Add changelog entry to `CHANGELOG.md`, follow our existing format
