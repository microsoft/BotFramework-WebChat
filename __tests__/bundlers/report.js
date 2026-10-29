// Injected by run.mjs before the app's scripts: records errors, and reports once Web Chat shows the bot message.

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
    const rendered =
      document.readyState === 'complete' &&
      !!document.querySelector('[role="feed"]')?.textContent.includes('Hello from the bot.') &&
      !!document.querySelector('textarea');

    if (rendered || errors.length) {
      clearInterval(interval);
      fetch('/__runner/report', { body: JSON.stringify({ errors, ok: rendered && !errors.length }), method: 'POST' });
    }
  }, 100);
})();
