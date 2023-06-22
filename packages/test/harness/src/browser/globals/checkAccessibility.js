/* globals axe */

import 'axe-core';

export default function initializeCheckAccessibility() {
  axe.configure({
    checks: [
      {
        evaluate: (node, { selector }) => !node.querySelector(selector),
        id: 'webchat-has-no-heading-one',
        metadata: {
          impact: 'moderate',
          messages: {
            pass: 'Web Chat has no level-one heading',
            fail: 'Web Chat must have no level-one heading'
          }
        },
        options: {
          selector:
            'h1:not([role], [aria-level]), :is(h1, h2, h3, h4, h5, h6):not([role])[aria-level="1"], [role=heading][aria-level="1"]'
        }
      }
    ],
    rules: [
      {
        all: ['webchat-has-no-heading-one'],
        id: 'webchat-has-no-heading-one',
        metadata: {
          description: 'As a component, ensures Web Chat does not contains any level-one heading.',
          help: 'No level-one heading is allowed in Web Chat',
          helpUrl: 'https://github.com/microsoft/BotFramework-WebChat/issues/4721'
        },
        selector: '#webchat',
        tags: ['webchat', 'cat.semantics', 'best-practice']
      }
    ]
  });

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
      } finally {
        console.log(`[TESTHARNESS] Accessibility checks took ${Date.now() - startTime} ms.`);
      }
    });
}
