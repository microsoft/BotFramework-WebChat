---
name: Feature request
about: Suggest an idea for this project
title: ''
labels: Enhancement, Pending
assignees: ''

---

<!--
To let use better understand your request, please follow this template and fill out as comprehensive as possible.

Creative ideas are not uncommon. Please check this query to see if anyone already on the same topic

https://github.com/microsoft/botframework-Webchat/issues?q=is%3Aissue+is%3Aopen+label%3ASample
-->

## User story

Today, auto complete is not implemented in the send box.

Tomorrow, I want to add auto complete to the send box. Our users are mostly on mobile devices. Tapping buttons than typing make the chatbot experience more attractive.

<!-- Please attach sketches with annotations, if any -->

## Alternatives

I have tried suggested actions but it does not fit in the user story because:

- They are not dynamic
- Only 5 of them is shown

## Other implementations

App ABC and XYZ implemented this feature. In app ABC, they show the auto-completes using inlined text. In app XYZ, they show the auto-completes on top of the input box.

<!-- Please attach screenshots, if any -->

## Potential implementation

<!-- If you would implement this feature, please let us know how it should be done -->

While the user is typing, we should send partial text to the bot via `typing` activity. And the bot would suggest in real time using suggested actions.

[Enhancement]
