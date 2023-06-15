/* globals axe */

import 'axe-core';

export default function initializeCheckAccessibility() {
  axe.configure({
    checks: [
      {
        enabled: false,
        id: 'page-has-heading-one'
      },
      {
        evaluate: () => true,
        id: 'webchat-has-no-heading-one-check',
        metadata: {
          impact: 'moderate',
          messages: {
            pass: 'Page contain no level-one heading',
            fail: 'Page should not contain any level-one heading'
          }
        }
      }
    ],
    rules: [
      {
        id: 'webchat-has-no-heading-one',
        metadata: {
          description: 'As a component, ensures Web Chat does not contains any level-one heading.',
          help: 'No level-one heading is allowed in Web Chat',
          helpUrl: 'https://github.com/microsoft/BotFramework-WebChat/issues/4721'
        },
        none: ['webchat-has-no-heading-one-check'],
        selector: 'h1,[role="heading"][aria-level="1"]',
        tags: ['webchat', 'wcag21a', 'wcag131']
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
