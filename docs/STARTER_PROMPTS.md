# Starter Prompts

Starter prompts are a special message that would send during greeting. It can consist of:

-  An optional image
-  An optional name of the bot (plain text)
-  An optional description about the bot (supports Markdown)
-  1 to 6 buttons with predefined message to assist customers to jumpstart the conversation
   -  A title for each button (plain text, required)
   -  The message to send or put in the send box when clicked (plain text, required)
   -  Notes: if the Starter prompts has no prompt buttons, service should not send Starter Prompts activity. Web Chat should ignore Starter Prompts activity without any buttons

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
