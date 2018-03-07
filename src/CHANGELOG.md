# Deprecations

## "formatOptions.showHeader" is deprecated, use "chatTitle" instead

`formatOptions` is a prop that contains `showHeader` only. The `showHeader` is a boolean flag that show/hide the chat title.

Customizable chat title is a [popular](https://github.com/Microsoft/BotFramework-WebChat/issues/754) [ask](https://github.com/Microsoft/BotFramework-WebChat/pull/810), thus, we added it. But instead of using the original `showHeader`, which literally means a boolean. We added `chatTitle` instead. Since `formatOptions` contains only one option `showHeader`, we are deprecating `formatOptions` together.

You can set `chatTitle` to `true` (a default localized chat title), `false` (hide chat title), or a string of your preferred chat title.
