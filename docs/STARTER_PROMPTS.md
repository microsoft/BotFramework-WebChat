# Starter Prompts

Starter prompts are a special message that would send during greeting. It can consist of:

-  An optional image
-  An optional name of the bot (plain text)
-  An optional description about the bot (Markdown)
-  1 to 6 buttons with predefined message to assist customers to jumpstart the conversation
   -  A title for each button (plain text, required)
   -  The message to send or put in the send box when clicked (plain text, required)
   -  Notes: if the Starter prompts has no prompt buttons, service should not send Starter Prompts activity. Web Chat should ignore Starter Prompts activity without any buttons

## UX design choices

- Buttons will show as a 3x2 grid when width of Web Chat is >= 500px. If it is <= 499px, buttons will show as a 1x3 grid with "show more"
- If there is a "Starter Prompts" activity being sent in the conversation, the "View prompts" button will always show on lower right, just above the send box
   - If suggested actions are shown, it will be show on top of the "View prompts" button
- Clicking on the "View prompts" button will pop up a modal dialog to select multiple buttons

## Payload

```json
{
   "type": "event",
   "name": "StarterPrompts", // Should we name this "greeting" event? And should it be camelCase, PascalCase, kebab-case?
   "entities": [
      {
         "@context": "https://schema.org",
         "@id": "",
         "@type": "Message",
         "type": "https://schema.org/Message",

         "keywords": ["WelcomeMessage"], // What name should we put in? Pre-chat message, Starter Prompts, greeting, welcome?
         "sender": {
            "@type": "Person",
            "description": "I can help you with anything around you. Just let me know.",
            "image": "https://.../bot.svg", // Could be data URI of an image.
            "name": "Secretary Bot"
         },
         "potentialActions": [
            {
               "@type": "SendAction",
               "name": "Check time",
               "object": {
                  "@type": "Message",
                  "text": "What time is it now?"
               }
            },
            {
               "@type": "SendAction",
               "name": "Check weather",
               "object": {
                  "@type": "Message",
                  "text": "Do I need to bring an umbrella?"
               }
            }
         ]
      }
   ]
}
```
