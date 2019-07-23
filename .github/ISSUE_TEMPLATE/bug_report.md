---
name: Bug report
about: Create a report to help us improve
title: ''
labels: Bug, Pending
assignees: ''

---

<!--
Thanks for posting the issue to us. Before posting, please remove any personally-identifiable information such as your  secret, token, or conversation ID.

To expedite the fix, please follow this template and fill out as concisely as possible.
-->

## Reproduce steps

1. Using style options, set background color to red
1. Type `herocard` to render a hero card

### Expectations

It should display the hero card with white background.

But instead, it displayed the hero card with red background.

<!-- If it did not render anything, please open Developer Tools in your browser and paste the console log here -->

<!-- Please attach any screenshots with annotations, if any -->

## Version

I tested on the following browsers:

- [ ] Chrome: `latest`
- [ ] Edge: `latest`
- [ ] Firefox: `latest`
- [ ] Internet Explorer: `11`

<!-- Please indicate if you host Web Chat under non-browser environment, e.g. Microsoft Teams, React Native, iOS WebView -->

I tested on the following versions and variants of Web Chat:

- [ ] Thru CDN, hosted by `https://cdn.botframework.com/`
- [ ] Thru NPM, React version of `16.x.x`
- [ ] Thru IFRAME, hosted by `https://webchat.botframework.com/embed/`

```
botframework-webchat:bundle:variant=
botframework-webchat:bundle:version=
botframework-webchat:core:version=
botframework-webchat:ui:version=
```

<!-- Please open Developer Tools and run the following script and paste the content:

[].map.call(document.querySelectorAll('meta[name^="botframework"]'), function (m) { return m.name + '=' + m.content; }).join('\n')
-->

## Steps to fix

I think the background color of hero card should default to white color, and settable thru style options.

## Additional context

I am rendering an Adaptive Card and here is the content of the card.

```json
{
  "$schema": "https://microsoft.github.io/AdaptiveCards/schemas/adaptive-card.json",
  "type": "AdaptiveCard"
}
```

[Bug]
