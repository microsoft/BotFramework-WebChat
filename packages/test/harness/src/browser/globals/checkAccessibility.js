/* globals axe */

import 'axe-core';

export default function initializeCheckAccessibility() {
  window.checkAccessibility ||
    (window.checkAccessibility = async function checkAccessibilityBrowser() {
      const startTime = Date.now();

      try {
        console.log('[TESTHARNESS] Accessibility checks started.');

        const results = await axe.run();
        const { violations } = results;

        if (!violations?.length) {
          return;
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

        throw new Error(`Accessibility violations found: ${violations.map(({ id }) => id).join(', ')}.`);
      } catch (error) {
        console.log(`[TESTHARNESS] Accessibility checks failed, took ${Date.now() - startTime} ms.`, error);

        throw error;
      } finally {
        console.log(`[TESTHARNESS] Accessibility checks completed, took ${Date.now() - startTime} ms.`);
      }
    })();
}
