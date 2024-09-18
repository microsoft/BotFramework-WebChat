# Citation

This document describes how citation works in Web Chat.

## Background

Adding citation in a message helps customers better understand the response.

Web Chat added citation support since [4.16.0](../CHANGELOG.md#4160---2023-11-16).

## Terminology

### Markdown reference style link

A type of link in Markdown that is located below the paragraph. It would reduce repetitiveness when multiple words shared the same link and improve readability.

### Sensitivity label

Additional metadata can be added to indicate how the content of the link should be used.

## Bot implementation

Bot developers would need to implement the citation as outlined in this section. The implementation below will enable livestreaming to both Azure Bot Services and Teams.

## Non-URL citation

Citation which does not have a link to point the user to. But part or whole of the cited content is attached in the activity.

### Activity text

-  It must be in Markdown format
-  It must use reference style link

#### Sample payload

Notes:

-  The third citation is a non-URL citation, its link `cite:1` is currently ignored

```md
Sure, you should override the default proxy settings[1]​[2], when your proxy server requires authentication[3].

[1]: https://support.microsoft.com/en-us/windows/use-a-proxy-server-in-windows-03096c53-0554-4ffe-b6ab-8b1deee8dae1 'Use a proxy server in Windows'
[2]: https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/configure-proxy-server-settings 'Configure proxy server settings - Windows Server'
[3]: cite:1 'Introduction Configuring proxy settings is a fundamental aspect...'
```

### Message object

![Direct Line activity graph](../media/direct-line-activity-graph.png)

Please refer to the graph for details of each fields. Notably:

-  Only nested objects are supported (a.k.a. "compact form"), flattened/referenced objects are not supported unless stated otherwise
-  Subclasses are not supported. If the object is expected to be `Message`, it must not be `EmailMessage` (subclass)

#### Sample payload

```json
{
   "@context": "https://schema.org",
   "@id": "",
   "@type": "Message",
   "citation": [
      {
         "@id": "https://support.microsoft.com/en-us/windows/use-a-proxy-server-in-windows-03096c53-0554-4ffe-b6ab-8b1deee8dae1",
         "@type": "Claim",
         "appearance": {
            "@type": "DigitalDocument",
            "encodingFormat": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "url": "https://support.microsoft.com/en-us/windows/use-a-proxy-server-in-windows-03096c53-0554-4ffe-b6ab-8b1deee8dae1",
            "usageInfo": {
               "@type": "CreativeWork",
               "additionalType": "https://copilotstudio.microsoft.com/sensitivity-labels/v1",
               "name": "General"
            }
         },
         "claimInterpreter": {
            "@type": "Project",
            "slogan": "Surfaced with Azure OpenAI",
            "url": "https://www.microsoft.com/en-us/ai/responsible-ai"
         },
         "position": "1"
      },
      {
         "@id": "https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/configure-proxy-server-settings",
         "@type": "Claim",
         "appearance": {
            "@type": "DigitalDocument",
            "dateModified": "2024-03-01T15:56:27.000-0800",
            "editor": "William Wong",
            "encodingFormat": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "url": "https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/configure-proxy-server-settings"
         },
         "claimInterpreter": {
            "@type": "Project",
            "slogan": "Surfaced with Azure OpenAI",
            "url": "https://www.microsoft.com/en-us/ai/responsible-ai"
         },
         "position": "2"
      },
      {
         "@id": "_:c1",
         "@type": "Claim",
         "appearance": {
            "@type": "DigitalDocument",
            "abstract": "Aute Lorem id laboris Lorem do dolor mollit. Officia dolore dolor do culpa nostrud velit officia...",
            "encodingFormat": "text/markdown",
            "name": "Sample Citation From File",
            "text": "Aute Lorem id laboris Lorem do dolor mollit. Officia dolore dolor do culpa nostrud velit officia magna ut aute pariatur excepteur ut cupidatat.",
            "usageInfo": {
               "@id": "_:s1",
               "@type": "CreativeWork",
               "additionalType": "https://copilotstudio.microsoft.com/sensitivity-labels/v1",
               "description": "Data is classified as Confidential but is NOT PROTECTED to allow access by approved NDA business partners. If a higher level of protection is needed please change the sensitivity level of the cited content.",
               "keywords": ["HasEncryption"],
               "name": "Confidential\\Any User (No Protection)",
               "pattern": {
                  "@type": "DefinedTermSet",
                  "inDefinedTermSet": "https://www.w3.org/TR/css-color-4/",
                  "name": "color",
                  "termCode": "orange"
               }
            }
         },
         "claimInterpreter": {
            "@type": "Project",
            "slogan": "Surfaced with Azure OpenAI",
            "url": "https://www.microsoft.com/en-us/ai/responsible-ai"
         },
         "position": "3"
      }
   ],
   "keywords": ["AIGeneratedContent"],
   "type": "https://schema.org/Message",
   "usageInfo": {
      "@id": "_:s1"
   }
}
```
