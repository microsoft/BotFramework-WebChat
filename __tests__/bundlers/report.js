// Injected before the app's scripts (see Dockerfile): records errors, and reports in `window.bundlerTestResult` once Web
// Chat shows the bot message, for run.mjs to read over WebDriver.

(() => {
  const errors = [];
  const { error } = console;

  console.error = (...args) => {
    errors.push(args.map(arg => arg?.stack || String(arg)).join(' '));
    error.apply(console, args);
  };

  // Capture phase: a script or style sheet that fails to load fires a non-bubbling "error" on its element.
  addEventListener(
    'error',
    event =>
      errors.push(
        event.target === window
          ? event.error?.stack || event.message
          : `Failed to load ${event.target.src || event.target.href}.`
      ),
    true
  );

  addEventListener('unhandledrejection', ({ reason }) => errors.push(reason?.stack || String(reason)));

  const interval = setInterval(() => {
    // element.html renders Web Chat in the shadow root of <webchat-element>, null until the element is defined.
    const element = document.querySelector('webchat-element');
    const root = element ? element.shadowRoot : document;
    const rendered =
      document.readyState === 'complete' &&
      !!root?.querySelector('[role="feed"]')?.textContent.includes('Hello from the bot.') &&
      !!root.querySelector('textarea');

    if (rendered || errors.length) {
      clearInterval(interval);
      window.bundlerTestResult = Object.freeze({ errors: Object.freeze([...errors]), ok: rendered && !errors.length });
    }
  }, 100);
})();
