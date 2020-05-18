# Accessibility

## Focus management

### Definitions

#### Focusable

-  Interactive UI element that can be focused programmatically or via user gesture other than the <kbd>TAB</kbd> key, e.g. tap or mouse click
-  It is optional to allow <kbd>TAB</kbd> key to focus on this element

#### Tabbable

-  A [focusable](#focusable) which can be focused on by pressing <kbd>TAB</kbd> key

### UX: A series of decisions

> This is related to https://github.com/microsoft/BotFramework-WebChat/issues/3135.

#### User story

The bot send a question with a set of predefined answers as UI buttons that will drive the conversation towards a particular goal (a.k.a. decision buttons).

After the user make the decision by clicking on a button, the decision is being submitted. The user is not allowed to reselect another decision.

The bot will then send another question with another set of answers.

#### User experience

We should disable buttons that are not part of the decision. Momentarily, the next set of answers will arrive. Since we must not change focus asynchronously outside of user gesture, the user is required to press <kbd>TAB</kbd> to get into the next set of decision buttons.

When the user <kbd>TAB</kbd> out of the current button and into the next set of buttons, we should disable all previous decision buttons including the one the user chose. This will give a more consistent UX on how buttons are disabled.

Since disabling buttons will also hide them from screen reader, we should add a screen reader-only text to tell the user which answer they chose.

#### Exceptions

-  If the bot responded a normal message instead of a set of decision buttons, the next <kbd>TAB</kbd> should goes into the send box.

### Do and don't

#### Do

-  After an element is removed from tab order, do put the focus on next logical tabbable
   -  "New messages" button
      -  After clicking on the "New messages" button, put the focus on the first tabbable of all unread activities, or the send box as last resort
      -  Related to [#3136](https://github.com/microsoft/BotFramework-WebChat/issues/3136)
   -  Suggested actions buttons
      -  After clicking on any suggested action buttons, put the focus on the send box, without soft keyboard
      -  For better UX, the activity asking the question should have the answer inlined
      -  Related to [#XXX](https://github.com/microsoft/BotFramework-WebChat/issues/XXX)

#### Don't

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
