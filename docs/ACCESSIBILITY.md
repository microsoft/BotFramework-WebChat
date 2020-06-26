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

# Focus management

## Definitions

### Focusable

-  Interactive UI element that can be focused programmatically or via user gesture other than the <kbd>TAB</kbd> key, e.g. tap or mouse click
-  It is optional to allow <kbd>TAB</kbd> key to focus on this element

### Tabbable

-  A [focusable](#focusable) element which can be focused on by pressing <kbd>TAB</kbd> key

## UX: A series of decisions

> This is related to https://github.com/microsoft/BotFramework-WebChat/issues/3135.

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

| Browser                | Element referenced by `document.activeElement`  | Element styled by `:focus` pseudo-class            | Element to focus after pressing <kbd>TAB</kbd>                    |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| Chrome/Edge (Chromium) | Become `document.body`                          | No elements are styled                             | Next tabbable sibling or descendants of them (depth-first search) |
| Edge (Legacy)          | Become `document.body`                          | No elements are styled unless `<body>` is tabbable | First tabbable descendants of `<body>`                            |
| Firefox/Safari         | Kept on the disabled element                    | Styles kept on the disabled element                | Next tabbable sibling or descendants of them (depth-first search) |
| Internet Explorer 11   | Become parent container of the disabled element | Parent container of the disabled element           | First tabbable descendants of parent container                    |

> On macOS Safari, <kbd>OPTION</kbd> + <kbd>TAB</kbd> is used to move focus between tabbable elements.

> On Firefox and macOS Safari, although disabled button appears to be focusable, they cannot be focused through <kbd>TAB</kbd> or JavaScript code.

## UX: New messages button

> This is related to [#3136](https://github.com/microsoft/BotFramework-WebChat/issues/3136).

### User story

When the user scrolls up to view past conversation and the bot sends a message with new decision buttons to the user, Web Chat places a "New messages" button on the screen to make the user aware of the new message.

The user should be able to move the focus to the "New messages" button by pressing <kbd>TAB</kbd>. Clicking on it will scroll the view to the first decision button and put the focus on it.

### Exceptions

If the new message does not contain any tabbable UI, it should move the focus to the send box after clicking on the "New messages" button.

### Implementation

The "New messages" button should be positioned in the DOM between the last read message and the first unread message.

When the "New messages" button is clicked:

-  Find the first message with a tabbable UI self or descendant
-  If a [tabbable](#tabbable) UI is found, focus on it
   -  Otherwise, focus on the send box wihout soft keyboard

### ARIA role "separator"

We are using the [ARIA role "separator"](https://www.w3.org/TR/wai-aria-1.1/#separator) for the "New messages" button. This is because the button serves as a visible boundary between read and unread messages, similar to a [horizontal ruler](https://www.w3.org/TR/html52/grouping-content.html#the-hr-element). Per [HTML 5.2 specifications](https://www.w3.org/TR/html52/grouping-content.html#the-li-element), the separator role is allowed to be used in the `<li>` element.

The separator role has a property called [children presentational](https://www.w3.org/TR/wai-aria-1.1/#childrenArePresentational). This property hides all children from assistive technology. Its effect is very similar to setting `role="presentation"` to all descendants and is not overrideable. Thus, it prevented us from using `<button>` widget inside the `<li role="separator">` element.

Fortunately, the separator role has two modes of operation: static structure or focusable widget. The "New messages" button is using the latter mode, which supports interactivity and movement.

When the "New messages" separator is activated, it logically moves the separator to the bottom of the page, thus, marking all messages as read. And we only support one direction and one amount of movement.

Lastly, we style the "New messages" separator like a normal button, styled it to float on top of the transcript, and added `click` and `keypress` event listener for <kbd>ENTER</kbd> and <kbd>SPACEBAR</kbd> key for [activation](https://www.w3.org/TR/wai-aria-practices-1.1/#button).

## UX: Message ordering

### User story

Azure Bot Services is a distributed system and message order is not guaranteed. Web Chat use insertion sort based on the timestamp to order messages.

Messages with a latter timestamp may arrive sooner than messages with a former timestamp. Thus, messages with latter timestamp could appear on the screen first. Then, messages with a former timestamp will get inserted before it.

Because the time between the insertion is usually very short (adjacent packet in a Web Socket connection), users may not see the insertion visually. But screen reader always read messages in the order they appear on the screen, regardless of their positions in the DOM tree. Thus, message order could be confusing to users who relies on screen reader.

### Implementations

`replyToId` is a property set by the bot to reference to an activity that it is replying to. Web Chat use the `replyToId` property as a hint for the message order.

-  When a message with a `replyToId` property arrive, Web Chat will check if it received the activity with the specified ID:
   -  If an activity were received with the specified ID, Web Chat will render the activity immediately
   -  If no activities were received with the specified ID, Web Chat will wait up to 5 seconds for the referencing activity to arrive
      -  If the activity arrive within 5 seconds, Web Chat will render the activity in the same render loop
      -  If the activity did not arrive within 5 seconds, Web Chat will render the activity
-  When a message without a `replyToId` property arrive, Web Chat will render the activity immediately

## UX: Live region transcript

### User story

In a [live region](https://www.w3.org/TR/wai-aria-1.1/#live_region_roles), it is difficult to control which part to be read or excluded from the screen reader.

And sometimes, browser or screen reader could be buggy on how the live region is getting read. For example:

-  [Chromium bug #910669](https://bugs.chromium.org/p/chromium/issues/detail?id=910669)
-  [Chromium bug #1067257](https://bugs.chromium.org/p/chromium/issues/detail?id=1067257)
-  [Android TalkBack bug #157888765](https://issuetracker.google.com/issues/157888765)

### Implementation

To make the live region more consistent across browsers and easier to control, we separated the live region from the visible transcript:

-  Two copies of transcript
   -  Visible, rich, dynamic, and interactive transcript
   -  Screen reader only transcript marked as live region
      -  Attachment contents will not be narrated: attachments can be customized and the DOM tree could be very complex with interactive elements
-  The live region contains recently arrived activities
   -  When the DOM element appear in the live region, screen reader will compute the alternative text and queue it for narration in a first-come-first-serve manner
   -  Screen reader will keep the alternative text in the queue even after the DOM element is removed from the live region
-  One second after the activity is rendered in the live region, Web Chat will remove it from the live region, this has a few benefits:
   -  Workaround some browser and screen reader bugs that may keep repeating the entire transcript
   -  Screen reader users will not be able to navigate into it and they will not notice there are 2 copies of the transcript
   -  If the removal is too fast:
      -  0-100 ms: Chrome and TalkBack on Android may miss some of the activities
      -  One second is chosen after some experiments

## Do and don't

### Do

-  After an element is removed from tab order, put the focus on next logical tabbable element
   -  "New messages" button
      -  After clicking on the "New messages" button, the focus should move to the first tabbable element of all the unread activities or the send box as last resort
      -  Related to [#3136](https://github.com/microsoft/BotFramework-WebChat/issues/3136)
   -  Suggested actions buttons
      -  After clicking on any suggested action buttons, the focus should move to the send box without soft keyboard
      -  For better UX, the activity asking the question should have the answer inlined
      -  Related to [#XXX](https://github.com/microsoft/BotFramework-WebChat/issues/XXX)

### Don't

-  Don't use numbers other than `0` or `-1` in `tabindex` attribute
   -  This will pollute the hosting environment
   -  Do not use `tabindex="-1"` in DOM nodes that don't need it, otherwise, it will be focusable by mouse
-  In an activity with question and answers, after clicking on a decision button, don't disable the button
   -  When the user reads the activity, the screen reader will only read the question but not the chosen answer
   -  It is okay to disable buttons that were not chosen as answer
   -  It is okay to disable all buttons, as long as the answer will be read by the screen reader
   -  Related to [#3135](https://github.com/microsoft/BotFramework-WebChat/issues/3135)
-  Don't move focus when an activity arrives (or asynchronously)
   -  Screen reader reading will be interrupted when focus change
   -  Only change focus synchronous to user gesture
   -  Related to [#3135](https://github.com/microsoft/BotFramework-WebChat/issues/3135)
