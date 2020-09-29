export default function createErrorBoundaryRenderer(...errorBoundaryMiddleware) {
  const render = concatMiddleware(...errorBoundaryMiddleware)({});

  return (...args) =>
    render(({ error, type }) => {
      console.warn(`botframework-webchat: Failed to "${type}".`, error);

      return false;
    })(
      ...args
    );
}
