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

-  A [focusable](#focusable) which can be focused on by pressing <kbd>TAB</kbd> key

## UX: A series of decisions

> This is related to https://github.com/microsoft/BotFramework-WebChat/issues/3135.

### User story

The bot send a question with a set of predefined answers as UI buttons that will drive the conversation towards a particular goal (a.k.a. decision buttons).

After the user make the decision by clicking on a button, the decision is being submitted. The user is not allowed to reselect another decision.

The bot will then send another question with another set of answers.

### Positive user experience

We should disable buttons that are not part of the decision. Momentarily, the next set of answers will arrive. Since we must not change focus asynchronously outside of user gesture, the user is required to press <kbd>TAB</kbd> to get into the next set of decision buttons.

When the user <kbd>TAB</kbd> out of the current button and into the next set of buttons, we should disable all previous decision buttons including the one the user chose. This will give a more consistent UX on how buttons are disabled.

Since disabling buttons will also hide them from screen reader, we should add a screen reader-only text to tell the user which answer they chose.

### Exceptions

-  If no tabbable UI after the current disabled button, the next <kbd>TAB</kbd> should goes into the send box.

### Implementation

When an UI is being disabled:

-  All UI will be manually styled, based on `:disabled, [aria-disabled="true"]` query
   -  User agent stylesheet do not take account into `aria-disabled` attribute
-  Set `aria-disabled` attribute to `true`
   -  If it is a `<button>`, set `onClick` to a handler that call `event.preventDefault()`
   -  If it is a `<input type="text">` or `<textarea>`, set `readOnly` to `true`
-  If it is currently focused, wait until `onBlur` event and set `disabled` attribute
   -  Otherwise, set `disabled` attribute immediately

> List of elements support `disabled` attribute can be found in [this article](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled).

### Additional context

By default, HTML is static. Thus, the default `disabled` implementation works on a static web page.

On a dynamic web page, when `disabled` is being applied to a focusing element (`document.activeElement`), the focus change varies between browsers:

-  Chrome will keep the focus on current element invisible to JavaScript or CSS
   -  On <kbd>TAB</kbd>, it jump to next tabbable sibling or descendants of them (depth-first search)
-  Firefox will send the focus to the parent, invisibly
   -  On <kbd>TAB</kbd>, it jump to the first tabbable sibling or descendants of them (depth-first search)
-  Edge UWP and IE11 will send the focus to `<body>`, invisibly
   -  On <kbd>TAB</kbd>, it jump to the first tabbable on the web page

## UX: New messages button

> This is related to [#3136](https://github.com/microsoft/BotFramework-WebChat/issues/3136).

### User story

While the user scrolled up to view past conversation, the bot send a message with few decision buttons to the user. To make the user aware of the arriving message, a "New messages" button is shown on the screen.

The user should be able to <kbd>TAB</kbd> into the "New messages" button. Clicking on it will scroll the view to the first decision button and put the focus on it.

### Exceptions

If the new message do not contains any tabbable UI, it should focus to the send box after clicking on the "New messages" button.

### Implementation

The "New messages" button should be positioned in the DOM between the last read message, and the first unread message.

When the "New messages" button is clicked:

-  Find the first message with a tabbable UI self or descendant
-  If a [tabbable](#tabbable) UI is found, focus on it
   -  Otherwise, focus on the send box wihout soft keyboard

## Do and don't

### Do

-  After an element is removed from tab order, do put the focus on next logical tabbable
   -  "New messages" button
      -  After clicking on the "New messages" button, put the focus on the first tabbable of all unread activities, or the send box as last resort
      -  Related to [#3136](https://github.com/microsoft/BotFramework-WebChat/issues/3136)
   -  Suggested actions buttons
      -  After clicking on any suggested action buttons, put the focus on the send box, without soft keyboard
      -  For better UX, the activity asking the question should have the answer inlined
      -  Related to [#XXX](https://github.com/microsoft/BotFramework-WebChat/issues/XXX)

### Don't

-  Don't use numbers other than `0` or `-1` in `tabindex` attribute
   -  This will pollute the hosting environment
-  In an activity with question and answers, after clicking on a decision button, don't disable the button
   -  When the user read the activity, the screen reader will only read the question but not the chosen answer
   -  It is okay to disable buttons that were not chosen as answer
   -  It is okay to disable all buttons, as long as the answer will be read by the screen reader
   -  Related to [#3135](https://github.com/microsoft/BotFramework-WebChat/issues/3135)
-  Don't move focus when an activity arrive (or asynchronously)
   -  Screen reader reading will be interrupted when focus change
   -  Only change focus synchronous to user gesture
   -  Related to [#3135](https://github.com/microsoft/BotFramework-WebChat/issues/3135)
