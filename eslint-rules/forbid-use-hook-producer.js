module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow calling a hook producer (a function ending with "Hooks") inside another custom hook (a function starting with "use").',
      category: 'Best Practices',
      recommended: 'error'
    },
    fixable: null,
    schema: [], // no options
    messages: {
      noHookProducersInHooks:
        'Calling a hook producer ({{ calleeName }}) inside another custom hook ({{ hookName }}) is not allowed.'
    }
  },
  create(context) {
    let currentHookName = null;

    function isHookName(name) {
      return name && /^use[A-Z0-9]/u.test(name);
    }

    function isHookProducerName(name) {
      // Ends with "Hooks" and starts with "use"
      return name && /^use[a-zA-Z0-9]*Hooks$/u.test(name);
    }

    return {
      // Check for function declarations: function useMyHook() { ... }
      FunctionDeclaration(node) {
        if (isHookName(node.id && node.id.name)) {
          currentHookName = node.id.name;
        }
      },
      // Check for arrow function expressions: const useMyHook = () => { ... }
      VariableDeclarator(node) {
        if (node.id && node.id.type === 'Identifier' && isHookName(node.id.name)) {
          if (node.init && (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')) {
            currentHookName = node.id.name;
          }
        }
      },
      'FunctionDeclaration:exit'(node) {
        if (node.id && node.id.name === currentHookName) {
          currentHookName = null;
        }
      },
      'VariableDeclarator:exit'(node) {
        if (node.id && node.id.type === 'Identifier' && node.id.name === currentHookName) {
          if (node.init && (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')) {
            currentHookName = null;
          }
        }
      },
      CallExpression(node) {
        if (currentHookName && node.callee.type === 'Identifier') {
          const calleeName = node.callee.name;
          if (isHookProducerName(calleeName)) {
            context.report({
              node: node.callee,
              messageId: 'noHookProducersInHooks',
              data: {
                calleeName,
                hookName: currentHookName
              }
            });
          }
        }
      }
    };
  }
};
