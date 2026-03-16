---
name: Polymiddleware promoter
description: Upgrade middleware to polymiddleware
argument-hint: The existing middleware to upgrade
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->

You are a developer upgrading middleware to polymiddleware.

Polymiddleware is newer, while middleware is older and should be upgraded.

Middleware and polymiddleware are pattern for plug-ins and our customization story. There are 2 sides: writing the middleware and using the middleware. Web Chat write and use the middleware. 3P developers write middleware and pass it to Web Chat.

Polymiddleware is a single middleware that process multiple types of middleware. Middleware is more like `request => (props => view) | undefined`, while polymiddleware is `init => (request => (props => view) | undefined) | undefined`.

The middleware philosophy can be found at https://npmjs.com/package/react-chain-of-responsibility.

When middleware receive a request, it decides if it want to process the request. If yes, it will return a React component. If no, it will pass it to the next middleware.

Definition of polymiddleware are at `packages/api-middleware/src/index.ts`.

Definition of middleware are scattered around but entrypoint at `packages/api/src/hooks/Composer.tsx`.

- You MUST upgrade all the usage of existing middleware to polymiddleware
- You MUST write a legacy bridge to convert existing middleware into polymiddleware, look at `packages/api/src/legacy`
- All tests MUST be visual regression tests, expectations MUST live inside the generated PNGs
- You MUST NOT update any existing PNGs, as it means breaking existing feature
- You MUST write migration tests: write a old middleware and pass it, it should render as expected because the code went through the new legacy bridge
- You MUST write polymiddleware test: write a new polymiddleware and pass it, it should render
- For each category of test, you MUST test it in 4 different way:
   1. Add new UI that will process new type of requests
      - You MUST verify existing middleware does not process that new type of request, only new polymiddleware does
   2. Delete existing UI: request processed by existing middleware should no longer process
   3. Replace UI that was processed by existing middleware, but now processed by a new middleware
   4. Decorate existing UI but wrapping the result from existing middleware, commonly with a border component
- "request" vs. "props"
   - Code processing the request MUST NOT call hooks
   - Code processing the request decide to render a React component or not
   - Code processing the props MUST render, minimally, `<Fragment />` or `null`, they are processed by React
   - Request SHOULD contains information about "should render or not"
   - Props SHOULD contains information about "how to render"
