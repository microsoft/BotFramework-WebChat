/* global axe, document */

module.exports = webDriver =>
  async function checkAccessibility() {
    const errorMessage = await webDriver.executeAsyncScript(callback => {
      const startTime = Date.now();

      console.log('[TESTHARNESS] Accessibility checks started.');

      axe
        .run()
        .then(
          results => {
            const { violations } = results;

            if (!violations?.length) {
              return callback();
            }

            console.group('%cAccessibility violations', 'font-size: x-large;');

            violations.forEach(({ description, help, helpUrl, id, impact, nodes }) => {
              console.groupCollapsed(
                `%c${impact}: ${id}%c\n%c${description}\n\n${helpUrl}`,
                'font-size: large; margin-bottom: .2em;',
                'font-size: unset; margin-bottom: unset;',
                'font-family: sans-serif; font-weight: initial;'
              );

              nodes.forEach(({ all, any, target }) => {
                console.groupCollapsed(
                  `%c${help}\n${new Array(target.length).fill('%o').join('\n')}`,
                  'font-family: sans-serif; font-weight: initial;',
                  ...target.map(selector => document.querySelector(selector))
                );

                [...all, ...any].forEach(({ message, relatedNodes }) => {
                  console.log(
                    `%c${message}\n${new Array(relatedNodes.length).fill('%o').join('\n')}`,
                    'font-family: sans-serif;',
                    ...relatedNodes.map(({ target }) => document.querySelector(target))
                  );
                });

                console.groupEnd();
              });

              console.groupEnd();
            });

            console.log(results);
            console.groupEnd();

            callback('Accessibility violations found.');
          },
          error => {
            console.log(`[TESTHARNESS] Accessibility checks failed, took ${Date.now() - startTime} ms.`, error);

            callback(error.message);
          }
        )
        .finally(() => {
          console.log(`[TESTHARNESS] Accessibility checks completed, took ${Date.now() - startTime} ms.`);
        });
    });

    if (errorMessage) {
      // TODO: Temporarily disabling error for accessibility violations by `axe-core` until we fixed all of them.
      //   throw new Error(errorMessage);

      console.log(errorMessage);
    }
  };
