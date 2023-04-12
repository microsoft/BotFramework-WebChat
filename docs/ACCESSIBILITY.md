```
     _                         _ _     _ _ _ _
    / \   ___ ___ ___  ___ ___(_) |__ (_) (_) |_ _   _
   / _ \ / __/ __/ _ \/ __/ __| | '_ \| | | | __| | | |
  / ___ \ (_| (_|  __/\__ \__ \ | |_) | | | | |_| |_| |
 /_/   \_\___\___\___||___/___/_|_.__/|_|_|_|\__|\__, |
                                                 |___/
```

<!--
Standard by Glenn Chappell & Ian Chai 3/93 -- based on Frank's .sig
Includes ISO Latin-1
figlet release 2.1 -- 12 Aug 1994
Modified for figlet 2.2 by John Cowan <cowan@ccil.org>
  to add Latin-{2,3,4,5} support (Unicode U+0100-017F).
Permission is hereby given to modify this font, as long as the
modifier's name is placed on a comment line.

Modified by Paul Burton  12/96 to include new parameter
supported by FIGlet and FIGWin.  May also be slightly modified for better use
of new full-width/kern/smush alternatives, but default output is NOT changed.

Font modified May 20, 2012 by patorjk to add the 0xCA0 character
-->

# Introduction

We are always working to improve the accessibility of our product.

You can view accessibility bugs and improvements that have already been filed using the [accessibility label](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+is%3Aopen+label%3A%22Area%3A+Accessibility%22).

The Web Chat team has a comprehensive accessibility test suite, performs thorough manual testing, and also uses [Microsoft FastPass](https://accessibilityinsights.io/docs/en/web/getstarted/fastpass/) to test new features and bug fixes.

To learn more about Assistive Technologies we test and support, please view the [technical support guide](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/TECHNICAL_SUPPORT_GUIDE.md#accessibility)

We welcome your feedback and will continue to improve the product in this area, as accessibility is one of our top priorities.

# Focus management

We follow [WAI-ARIA guidelines on focus management](https://www.w3.org/TR/wai-aria/#managingfocus).

## Definitions

### Focusable

-  Interactive UI element that can be focused programmatically or via user gesture other than the <kbd>TAB</kbd> key, e.g. tap or mouse click
-  It is optional to allow <kbd>TAB</kbd> key to focus on this element

### Tabbable

-  A [focusable](#focusable) element which can be focused on by pressing <kbd>TAB</kbd> key
-  Tabbable elements may not available and is not expected to function properly on mobile devices. These devices usually do not have a physical keyboard input

## UX: Navigating activities in the chat history

> This is related to [#2996](https://github.com/microsoft/BotFramework-WebChat/issues/2996).

### User story

The user should be able to navigate across multiple activities in the chat history using navigation keys, such as <kbd>UP</kbd>, <kbd>DOWN</kbd>, <kbd>HOME</kbd> and <kbd>END</kbd> keys. The navigation keys are based on the [WAI-ARIA best practices for grid widget](https://www.w3.org/TR/wai-aria-practices-1.1/#grid).

Optionally, when the user presses <kbd>ESCAPE</kbd> when focused on the chat history, focus will be blurred and sent to the send box.

Although the chat history can be navigated using navigational keys and a keyboard visual indicator is placed around the activity and the chat history, the navigation is not considered a selection (such as `aria-selected="true"`).

Unless the chat history is empty, at any time when the chat history is focused, exactly one activity will be highlighted (a.k.a. active). If no prior activity are highlighted, the most recent (bottommost) activity will be highlighted. The highlighted activity will be reset when the chat history is modified through user intentions, such as sending a message, or tapping on a suggested actions. This is introduced in PR [#4108](https://github.com/microsoft/BotFramework-WebChat/pull/4108).

### Focus redirector

Focus redirector is an element to capture and redirect focus, enabling <kbd>TAB</kbd> to jump in a specific sequence that would otherwise be impossible to jump using tab sequence in regards to the DOM.

The focus redirector element itself is focusable and invisible. When focused, it will programmatically send the focus to a target element.

They are commonly used in modal dialogs as focus trap, a mechanism to prevent focus from moving outside of the dialog.

Note that on focus, the browser will scroll the focused element into view. This behavior is not preventable (tested through `event.preventDefault()` on `focus` event listener in bubbling and capturing phase). Therefore, when placing focus redirector inside a scrollable container, some considerations should be made about its size and position.

### Hiding focusable elements in the chat history

While focusing within the chat history and the user presses <kbd>TAB</kbd>, it should skip all focusables in the chat history and focus on the next tabbable element **after** the chat history.

To avoid any DOM elements under a subtree being focusable, HTML introduced a new [`inert` attribute](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees). However, this attribute is not widely adopted. Although polyfill is available, using it may introduce a performance penalty. Thus, we are not using `inert` attribute at this time.

As a workaround, we added a "terminator" indicator as the last focusable element of the chat history. When the user presses <kbd>TAB</kbd> inside the chat history, the focus will land on this element before leaving the chat history. The element is being narrated as "End of chat history". The user will know that they are now at the end of the chat history, and they are expected to press <kbd>TAB</kbd> again to focus on the next tabbable element after the chat history.

### Focus on interactive elements inside the activity

Adaptive Cards, some type of attachments, or custom activities could contains interactive elements. We will provide 2 levels of focus management: across activities and inside an interactive activity.

-  Across activities: When the focus is on the chat history, users can press <kbd>UP</kbd>, <kbd>DOWN</kbd>, <kbd>HOME</kbd> and <kbd>END</kbd> keys to navigate across activities
   -  To put the focus inside an interactive activity, while the user is on the activity they want to give more attentions to, they should press <kbd>ENTER</kbd> key to focus inside the activity
   -  There will be no-op if the user press <kbd>ENTER</kbd> on a non-interactive activity
-  Inside an activity: When the focus is placed inside an interactive activity, the focus will be trapped inside the activity
   -  To leave the focus trap, the user should press the <kbd>ESCAPE</kbd> key

### <kbd>PAGE UP</kbd> and <kbd>PAGE DOWN</kbd> keys should not change focus

<kbd>PAGE UP</kbd> and <kbd>PAGE DOWN</kbd> keys will scroll the chat history. However, it should not move the visual keyboard indicator. The highlighted activity should remains the same after pressing the <kbd>PAGE UP</kbd> and <kbd>PAGE DOWN</kbd> keys.

### Scroll on focus

When using <kbd>UP</kbd>, <kbd>DOWN</kbd>, <kbd>HOME</kbd> and <kbd>END</kbd> keys to highlight messages, it should scroll the message into view.

If the message is too large to fit into view, it should scroll to the nearest end of the message:

-  Pressing <kbd>UP</kbd> key should scroll the message above into the view by aligning the bottom edge of the message with the bottom edge of the scrollable container
-  Pressing <kbd>DOWN</kbd> key should scroll the message below into the view by aligning the top edge of the message with the top edge of the scrollable container
-  Pressing <kbd>HOME</kbd> key should scroll the first message into the view by aligning the top edge of the first message with the top edge of the scrollable container
-  Pressing <kbd>END</kbd> key should scroll the last message into the view by aligning the bottom edge of the last message with the bottom edge of the scrollable container

If the message is being highlighted using a pointer device, it should not scroll the scrollable container. This is to align with browser default behavior.

### Implementation

The keyboard navigation model is based on [WAI-ARIA best practices on managing focus in composites](https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant). This model allows two focii (main focus and `aria-activedescendant` focus) to appear at the same time and is for composite widgets such as combobox, grid, and other complex widgets.

The chat history itself is the main focus, which can be focused by <kbd>TAB</kbd> or click. The activity is focused by referencing through the `aria-activedescendant` attribute on the chat history.

To focus on an activity:

-  The user focuses on the chat history by pressing <kbd>TAB</kbd> or click
-  The default focused activity is the bottommost activity
-  The user can press navigational keys to focus on other activities

Using keyboard, to focus on tabbable elements in an activity, such as buttons inside an Adaptive Card:

-  The user should first focus on the chat history and the activity
-  The user should then press <kbd>ENTER</kbd> to "enter"/focus on the content
-  The first tabbable elements in the activity or attachment will be focused
-  After pressing the <kbd>TAB</kbd> key on the very last tabbable element in the activity, it should will "wraparound" and send the focus to the first tabbable elements in the activity
   -  <kbd>SHIFT</kbd> + <kbd>TAB</kbd> from the first tabbable element will send the focus to the last tabbable element
   -  The wraparound behavior is first introduced in PR [#4108](https://github.com/microsoft/BotFramework-WebChat/pull/4108)
-  To leave the focus trap, the user should press <kbd>ESCAPE</kbd> key and the focus will send to the chat history and the activity

## UX: Scrolling through the chat history using keyboard

The user should be able to quickly scroll through the chat history using keyboard, in addition to mouse wheel or flick gesture.

### Navigational keys used in send box

Depending on the state of the send box, <kbd>PAGE UP</kbd>, <kbd>PAGE DOWN</kbd>, <kbd>HOME</kbd> and <kbd>END</kbd> may be captured by the browser. For example, if the send box is not empty, pressing <kbd>HOME</kbd> should move the caret to in front of the first letter.

When the send box is not empty, the navigational keys must not be used for scrolling the chat history.

### Holding the navigational key

When the user holds the <kbd>PAGE UP</kbd> and <kbd>PAGE DOWN</kbd> keys, the chat history should scroll repetitively using the system's keyboard repeat rate and delay.

### Implementation

To scroll up and down, the user should focus on the (empty) send box, then press <kbd>PAGE UP</kbd> and <kbd>PAGE DOWN</kbd>. Optionally, <kbd>HOME</kbd> and <kbd>END</kbd> may be used to scroll to the end of the chat history.

## UX: A series of decisions

> This is related to [#3135](https://github.com/microsoft/BotFramework-WebChat/issues/3135).

### User story

The bot sends a question with a set of predefined answers as UI buttons that will drive the conversation towards a particular goal (a.k.a. decision buttons).

After the user makes their decision by clicking on a button, the decision is submitted. The user is not allowed to reselect another decision.

The bot will then send another question with another set of answers.

### Positive user experience

Once the user makes their selection, we should disable the decision buttons. Since the next question and set of possible decisions do not arrive immediately from the bot, we can not change the focus asynchronously outside of user gestures. Consequently, the user is required to press <kbd>TAB</kbd> to move the focus to the next set of decision buttons.

When the user presses the <kbd>TAB</kbd> key to move the focus from the current button to the next set of buttons, all the previous decision buttons should be disabled including the button the user chose. This will give a more consistent UX on how buttons are disabled.

Since disabling buttons will also hide them from screen reader, we should add a screen reader-only text to tell the user which answer they chose.

### Exceptions

-  If there is not a tabbable UI after the current disabled button, the next <kbd>TAB</kbd> should move the focus to the send box.

### Implementation

When a UI element is being disabled:

-  All UI will be manually styled, based on `:disabled, [aria-disabled="true"]` query
   -  User agent stylesheet do not take account into `aria-disabled` attribute
-  Set `aria-disabled` attribute to `true`
   -  If the element is a `<button>`, `onClick` is set to a handler that calls `event.preventDefault()`
   -  If the element is an `<input type="text">` or `<textarea>`, `readOnly` is set to `true`
-  Set `tabindex` attribute to `-1`
   -  The element will continue to be focused. But when the focus has moved away, the user can never use the <kbd>TAB</kbd> key to move the focus back to the element
-  ~If the element is currently focused, the component will wait until the `onBlur` event is called to set the `disabled` attribute to `true`~
   -  ~Otherwise, the `disabled` attribute will be set to `true` immediately~

> List of elements support `disabled` attribute can be found in [this article](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled).

### Additional context

By default, HTML is static. Thus, the default `disabled` implementation works on a static web page.

On a dynamic web page, when `disabled` is being applied to a focusing element (`document.activeElement`), the focus change varies between browsers:

| Browser                          | Element referenced by `document.activeElement`  | Element styled by `:focus` pseudo-class            | Element to focus after pressing <kbd>TAB</kbd>                    |
| -------------------------------- | ----------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| Chrome/Microsoft Edge (Chromium) | Become `document.body`                          | No elements are styled                             | Next tabbable sibling or descendants of them (depth-first search) |
| Microsoft Edge (Legacy)          | Become `document.body`                          | No elements are styled unless `<body>` is tabbable | First tabbable descendants of `<body>`                            |
| Firefox/Safari                   | Kept on the disabled element                    | Styles kept on the disabled element                | Next tabbable sibling or descendants of them (depth-first search) |
| Internet Explorer 11             | Become parent container of the disabled element | Parent container of the disabled element           | First tabbable descendants of parent container                    |

> On macOS Safari, <kbd>OPTION</kbd> + <kbd>TAB</kbd> is used to move focus between tabbable elements.

> On Firefox and macOS Safari, although disabled button appears to be focusable, they cannot be focused through <kbd>TAB</kbd> or JavaScript code.

## UX: New messages button

> This is related to [#3136](https://github.com/microsoft/BotFramework-WebChat/issues/3136).

### User story

When the user scrolls up to view past conversation and the bot sends a message with new decision buttons to the user, Web Chat places a "New messages" button on the screen to make the user aware of the new message.

The user should be able to move the focus to the "New messages" button by pressing <kbd>TAB</kbd>. Clicking on it will scroll the view to the first decision button and put the focus on it.

Web developers can also use our `styleOptions.autoScrollSnapOn*` to control how the auto scroll behaves. This is introduced in PR [#3653](https://github.com/microsoft/BotFramework-WebChat/pull/3653).

### Exceptions

If the new message does not contain any tabbable UI, it should move the focus to the send box after clicking on the "New messages" button.

### Implementation

The "New messages" button should be positioned as the first item in the chat history. The chat history is a "composite" widget and is focusable. When the focus in on the chat history, pressing <kbd>TAB</kbd> should put the focus on the "New messages" button.

When the "New messages" button is clicked, focus should return to the chat history and put the `aria-activedescendant` focus on the first new activity, showing a visual keyboard indicator around the activity.

## UX: Message ordering

### User story

Chat services is possibly a distributed system and message order is not always guaranteed. To order messages, Web Chat use insertion sort based on a monotonic-increasing integer sequence ID. If sequence ID is not available, timestamp will be assumed.

Messages with a larger (newer) sequence ID may arrive before messages with a smaller (older) sequence ID. Thus, messages with a larger sequenc eID could appear on the screen first. Then, messages with a smaller sequence ID will get inserted before it.

Because the time between the insertion could be very short (adjacent packet in a Web Socket connection), users may not see the insertion visually. But the screen reader always reads the messages in the order they appear on the screen, regardless of their positions in the DOM tree. Thus, the message order could be confusing to users who rely on the screen reader.

![Direct Line sequence diagram](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/main/docs/media/direct-line-sequence-diagram.png)

### Implementations

We will rectify message order using the `replyToId` property.

`replyToId` is a property set by the Bot Framework SDK and it references the activity the bot is replying to. Web Chat uses the `replyToId` property as a hint when rectifying the message order.

-  When a message with a `replyToId` property arrives, Web Chat will check if it received the activity with the specified ID:
   -  If an activity was received with the specified ID, Web Chat will render the activity immediately
   -  If another activity with the same `replyToId` is rendered, Web Chat will render the activity immediately
      -  Another activity with the same `replyToId` means, either the predecessor has arrived or declared as lost
   -  If no activities were received with the specified ID, Web Chat will wait up to 5 seconds for the referencing activity to arrive
      -  If the activity arrive within 5 seconds, Web Chat will render the activity in the same render loop
      -  If the activity did not arrive within 5 seconds, Web Chat will render the activity
-  When a message without a `replyToId` property arrives, or is the first activity in the chat history, Web Chat will render the activity immediately
   -  Currently, there is a limitation in the Bot Framework SDK. The first activity will always comes with a `replyToId` property even it is not replying to any conversations

## UX: Live region chat history

### User story

In a [live region](https://www.w3.org/TR/wai-aria-1.1/#live_region_roles), it is difficult to control which part is read or excluded from the screen reader.

Also, browsers and screen readers can be inconsistent on reading the live region. For example:

-  [Chromium bug #910669](https://bugs.chromium.org/p/chromium/issues/detail?id=910669)
-  [Chromium bug #1067257](https://bugs.chromium.org/p/chromium/issues/detail?id=1067257)
-  [Android TalkBack bug #157888765](https://issuetracker.google.com/issues/157888765)

### Implementation

To make the live region more consistent across browsers and easier to control, we separated the live region from the visible chat history:

-  Two copies of chat history
   -  Visible, rich, dynamic, and interactive chat history
   -  Screen reader only reads the chat history marked as live region
      -  Web Chat does not narrate attachment contents: attachments can be customized and the DOM tree could be very complex with interactive elements
      -  Empty messages will be narrated if they have suggested actions
-  The live region contains activities that were recently
   -  When the DOM element appear in the live region, the screen reader will compute the alternative text and queue it for narration in a first-come-first-serve manner
   -  The screen reader will keep the alternative text in the queue even after the DOM element is removed from the live region
-  One second after the activity is rendered in the live region, Web Chat will remove it from the live region. This has a few benefits:
   -  Workaround some browser and screen reader bugs that may keep repeating the entire chat history
   -  The screen reader users will not be able to navigate into it and they will not notice there are 2 copies of the chat history
   -  If the removal is too fast:
      -  0-100 ms: Chrome and TalkBack on Android may miss some of the activities
      -  The development team settled on using one second after some experimentation
-  The suggested actions should be narrated inside the live region twin
   -  Suggested actions usually come with message activity
   -  Having 2 or more live regions updated at the same time will confuse browser and interrupt each other
   -  If more than one live regions are expected to update at the same time, they should be consolidated

### Technical Limitation

-  Activity timestamp announcement: related to [#3136](https://github.com/microsoft/BotFramework-WebChat/issues/3136)
   -  Problem definition: when the developer overrides the 'groupTimestamp' props and sets it to `true` or to some interval, screen reader still announces every activity with its associated timestamp.
   -  Explanation of current behavior: Once activity is marked as sent, it is written to DOM as well as its timestamp; the timestamp grouping logic is executed only when the next activity arrives. As mention earlier once a text is queued for narration and even if DOM element is removed it will still be announced by the screen reader as it is not technically possible to removed from the narration queue.
   -  Given above limitation even if we removed the timestamp element from DOM after group timestamp logic is executed this will not change the screen reader behavior.
   -  As per accessibility team review/recommendation: there is no hiding or loss of information in this case - so will keep the current behavior as is.

## Controlling the narration of activities and attachments

> This is related to [#3360](https://github.com/microsoft/BotFramework-WebChat/issues/3360), [#3615](https://github.com/microsoft/BotFramework-WebChat/issues/3615), [#3918](https://github.com/microsoft/BotFramework-WebChat/issues/3918).

### User story

A bot developer wants to set the narration for a message activity. The activity may or may not have attachments.

It is required for the following user stories:

-  The message contains Markdown
   -  For example, the `text` field is `"Hello, *World!*"`
   -  Desirable: narrate "hello world"
   -  Undesirable: "hello (pause) asterisk world asterisk"
-  The message contains HTML
   -  For example, the `text` field is `"### Exchange rate\n\n<table><tr><th>USD</th><td>1.00</td></tr><tr><th>JPY</th><td>0.91</td></tr></table>"`
   -  Desirable: narrate "exchange rate for 1 US dollar is 0.91 Japanese yen"
   -  Undesirable: any HTML or Markdown syntax
-  The message contains a document, such as an insurance policy
   -  For example, the `text` field is `"Insurance policy:"`, and the attachment contains a file named `12345678-1234-5678-abcd-12345678abcd.doc`
   -  Desirable: narrate "the insurance policy is ready to download"
   -  Undesirable: any narration containing the bogus file name

### Implementation

Currently, the [Bot Framework Activity spec](https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md) does not provide any field for text alternatives.

A new field `webchat:fallback-text` is added to `channelData` field with the following logic:

1. If `channelData['webchat:fallback-text']` field present
   -  The field should not be empty
   -  The field should contains narration including activity text content and its attachments
   -  If the field is empty, it will not narrate as live region. However, when navigating the transcript, it will continue narrating the activity
   -  For presentational content, `activityMiddleware` should be used to customize the activity
2. Otherwise
   -  If `textFormat` is `markdown`
      -  [Remove Markdown syntax from `text` field](#remove-markdown-syntax-from-text-field) with best effort
      -  Narrate the `text` field with Markdown syntax removed, followed by every attachment rendered through `attachmentForScreenReader` middleware
   -  Otherwise
      -  Narrate the `text` field as-is, followed by every attachment rendered through `attachmentForScreenReader` middleware
   -  Note the `text` field is optional

### Remove Markdown syntax from `text` field

> This algorithm is subject to change to provide a better text alternatives experience. For consistent result, please use the `channelData['webchat:fallback-text']` field instead.

If the `channelData['webchat:fallback-text']` field is not present, we will use best effort to convert Markdown text for screen reader.

-  Use `useRenderMarkdown` hook to render the Markdown into HTML (as string)
   -  The hook will use the `renderMarkdown` prop passed to Web Chat and it can be customized by the web developer
-  Use `DOMParser().parseFromString()` to parse the HTML string into `HTMLDocument`
-  Walk all the nodes in the `HTMLDocument`, flatten and concatenate
   -  If it is a text node, get the `textContent`
   -  If it is a `<img>` element, get the `alt` attribute

Applying the logic to samples above:

-  The message contains Markdown
   -  If the `text` field is `"Hello, *World!*"`
   -  Narration will be "Hello, World!"
-  The message contains HTML
   -  If the `text` field is `"## Exchange rate:\n\n<table><tr><th>USD</th><td>1.00</td></tr><tr><th>JPY</th><td>0.91</td></tr></table>"`
   -  Narration will be "Exchange rate: USD 1.00 JPY 0.91"
-  The message contains a document, such as an insurance policy
   -  If the `text` field is `"Insurance policy:"`, and the attachment contains a file named `12345678-1234-5678-abcd-12345678abcd.doc`
   -  Narration will be "Insurance policy: A file: 12345678-1234-5678-abcd-12345678abcd.doc"

# Screen reader renderer for custom activities and attachments

Web Chat render components are accompanied by a screen reader renderer to maximize accessibility. In the case of custom components, the bot/Web Chat developer will need to implement a screen reader renderer for the equivalent custom visual component.

![image: Console warning: "No renderer for attachment for screen reader of type "application/vnd.microsoft.card.adaptive"](https://user-images.githubusercontent.com/14900841/106323546-6f47ed80-622c-11eb-96d7-de6f72818525.png)

The Web Chat team **DOES NOT** recommend disabling warning messages regarding screen readers and accessibility. However, if the developer decides to suppress these messages, it can be done by adding the following code to `attachmentForScreenReaderMiddleware` in the `Composer` props.

```js
const attachmentForScreenReaderMiddleware = () => next => () => {
   return false;
};
```

This will prevent the screen reader renderer warning from appearing in the browser console.

# Using `role="feed"` and `role="article"` to represent the chat history and activity

> This is introduced in PR [#4108](https://github.com/microsoft/BotFramework-WebChat/pull/4108).

We are using `role="feed"` and `role="article"` to represent the chat history and activity respectively:

-  `role="feed"` is designed for very long content and also support virtual scrolling via `aria-busy`
-  We should not use `<ul>` as it will push the content into second level, despite `list-style-type: none` is set
-  In WAI-ARIA guideline, `role="feed"`/`role="article"` are designed to contain nested interactive elements, such as comment box, etc. This is more aligned to our Adaptive Cards and our interactive attachment story

# UX: Narration of messages

> This is introduced in PR [#4108](https://github.com/microsoft/BotFramework-WebChat/pull/4108).

There are 3 ways a screen reader can read messages:

-  Live region
   -  It should automatically read when the message first appear in the chat history
   -  It should read the message text, and its attachments, such as "Yes button"
   -  It should NOT read the timestamp. As the message just arrived, the timestamp is redundant
   -  It should read suggested actions, regardless whether the message is empty or not
   -  If the message or its attachments contains links or interactive elements
      -  If the message or its attachments contains links, it should read hints about the links, otherwise;
      -  If the message or its attachments contains interactive elements, such as button, is detected, it should read hints about interactive content
   -  If the message contains suggested actions, it should read hints about suggested actions
   -  If any messages failed to send recently, it should read hints about the failure
      -  It should not read if the message is presentational, such as `event` or `typing` activities
-  Focus landing on the message via chat history navigation
   -  It should read the message, and count of attachments, e.g. "2 attachments"
   -  To make the readings brief, it should not read the timestamp
   -  If the message is outgoing message and failed to send, it should read hints about the failure
   -  If links are detected in the message or its attachments, it should read hints about the links, otherwise;
   -  If interactive elements, such as button, is detected, it should read hints about interactive content
-  Browse mode (a.k.a. scan mode)
   -  It should read as much details as the message contains
   -  This mode can be triggered when the user is browsing with screen reader specific keyboard shortcut keys, or by dragging their finger across the chat history on a mobile device
   -  When in browse mode, we no longer need to "click to interact", as the user can browser all attachments freely

## Actual narrations

Given the following message with an Adaptive Card and two buttons.

![A message with an Adaptive Card, with two buttons, "United States" and "Hong Kong".](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/main/docs/media/webchat-accessibility-narration-interactive-message.png)

<details>
<summary>Click to see the activity in JSON format</summary>

```json
{
   "type": "message",
   "id": "c00001-us|0000003",
   "timestamp": "2022-05-27T03:08:00.000Z",
   "channelId": "directline",
   "from": {
      "id": "webchat-mockbot",
      "name": "webchat-mockbot"
   },
   "conversation": {
      "id": "c00001-us"
   },
   "locale": "en-US",
   "text": "Where are you from?",
   "attachments": [
      {
         "contentType": "application/vnd.microsoft.card.hero",
         "content": {
            "buttons": [
               {
                  "type": "imBack",
                  "title": "United States",
                  "value": "herocard qna 2 I am from United States."
               },
               {
                  "type": "imBack",
                  "title": "Hong Kong",
                  "value": "I am from Hong Kong."
               }
            ]
         }
      }
   ],
   "replyToId": "c00001-us|0000002"
}
```

</details>

The following narrations were captured from Web Chat 4.15.2, on Windows 11 (22H2 22621.1) with Microsoft Edge 101.0.1210.53. Other browsers and screen readers should provide similar narrations.

Screen readers do not read punctuations, we added them for readability.

### Live region

The screen reader should read "Bot said: Where are you from? Article. Contains 1 items, 1 of 1 level 1. A card: article. A card: United States button, Hong Kong button. Message is interactive. Press shift tab key 2 to 3 times to switch to the chat history. Then click on the message to interact."

### Focus landing on the message via chat history navigation

> Note: chat history navigation requires a keyboard and may not work on all mobile devices.

The screen reader should read "Bot said: Where are you from? One attachment. Message is interactive. Click to interact. Article."

### Browse mode

The screen reader should read "Bot said: Where are you from? Bot attached. Menu item, 1 of 2, United States. Menu item, 2 of 2, Hong Kong. Send at May 26th 8:08 PM."

# UX: Keyboard help screen

> This is introduced in PR [#4108](https://github.com/microsoft/BotFramework-WebChat/pull/4108).

To help keyboard users on how to navigate the chat history, we have a keyboard help screen. Its activation is similar to the common "skip to content" accessible link and can only be activated through <kbd>TAB</kbd> key.

![Keyboard help screen](https://user-images.githubusercontent.com/1622400/153072728-5d903a2a-dfe2-45bb-800d-d79e8afd95c8.png)

# Do's and don't

## Do

-  Triggered by user intentions, after an element is removed from tab order, put the focus on next logical tabbable element
   -  "New messages" button
      -  After clicking on the "New messages" button, the focus should move to the first tabbable element of all the unread activities or the send box as last resort
      -  Related to [#3136](https://github.com/microsoft/BotFramework-WebChat/issues/3136)
   -  Suggested actions buttons
      -  After clicking on any suggested action buttons, the focus should move to the send box without soft keyboard
      -  For better UX, the activity asking the question should have the answer inlined
      -  Related to [#3135](https://github.com/microsoft/BotFramework-WebChat/issues/3135)
   -  Don't move focus if the element is removed outside of user intentions

## Don't

-  Don't use numbers other than `0` or `-1` in `tabindex` attribute
   -  This will pollute the hosting environment
   -  Do not use `tabindex="-1"` in DOM nodes that don't need it, otherwise, it will be focusable by mouse
-  In an activity with question and answers, after clicking on a decision button, don't disable the button
   -  When the user reads the activity, the screen reader will only read the question but not the chosen answer
   -  It is okay to disable buttons that were not chosen as answer
   -  It is okay to disable all buttons, as long as the answer will be read by the screen reader
   -  Related to [#3135](https://github.com/microsoft/BotFramework-WebChat/issues/3135)
   -  One possible implementation:
      1. For all buttons in the decision set
      1. Set `aria-disabled` to `true`, screen reader will narrate it as disabled
      1. Set `tabindex` to `-1`, after pressing <kbd>TAB<kbd> key to move focus away from the button, it will no longer accessible by keyboard again
      1. Style the button as disabled
      1. Remove all `click` event handlers
-  Don't move focus when an activity arrives (or asynchronously)
   -  Screen reader reading will be interrupted when focus changes
   -  Only change focus synchronous to user gesture
   -  Related to [#3135](https://github.com/microsoft/BotFramework-WebChat/issues/3135)
