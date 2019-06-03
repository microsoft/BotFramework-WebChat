# botframework-webchat-embed

This package contains the source code for the embed page at https://webchat.botframework.com/.

> For transparency and completeness, we are maintaining the code here. This code is coupled to our servers. In order to host this page on your own website, you will need to decouple it or provide the same set of REST APIs.

## Background

Web Chat offers multiple levels of integration options. In this package, we focus on embedding `<iframe>` element in your web page.

`<iframe>` is the simplest way to connect your website to Azure Bot Services. If you prefer more advanced features or customization options, please refer to [this migration guide](https://github.com/microsoft/botframework-webchat/blob/master/README.md#migrating-from-v3-to-v4-of-web-chat) for details.

There are a few features unique to `<iframe>`:

-  Reading configurations from Azure Bot Services
-  Simplified version selection
   -  Based on the versions you selected (latest, specific major, or specific minor), we will serve the Web Chat client with latest security fixes
   -  Please refer to the [I want to go back documentation](#i-want-to-go-back-to-previous-versions-of-web-chat) to specify the version you want to use
-  This creates the same experience as the "Test in Web Chat" blade in Azure Portal

## How to use

To use the embed page, you will need the site secret from your Azure Bot Services page. Once you have the secret, add the following to your page.

```html
<iframe src="https://webchat.botframework.com/embed/your-bot-id?s=your-site-secret"></iframe>
```

**For production use, we strongly prefer you to use token instead of secret.** Please refer to [this article](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication) for how to generate token out of secret.

```html
<iframe src="https://webchat.botframework.com/embed/your-bot-id?t=your-site-token"></iframe>
```

Please look at [this table](#what-url-parameters-are-supported) for list of URL parameters supported.

## Development

### Building the page

Follow steps below to build the embed page locally.

1. `npm install`
1. `npm run prepublishOnly`
1. Publishes the build artifact at `/dist/index.html`
   1. Verifies the file size. It should be less than 30 KB

### Updating servicing plan

`servicingPlan.json` is the deployment plan. It provides details about where to locate assets, how to set up, and when to deprecate our older bits.

When modifying the servicing plan to point to newer assets, make sure it is pointing to immutable copies on CDN. For example, you want to use assets with hashed filenames. Since we are using subresource integrity, this will make sure the servicing plan and assets can be invalidated on CDN cache asynchronously.

#### Generating hash for subresource integrity

For traceability of deployment, we are using [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).

To generate SHA384 for a specific asset from an URL, run the following command in [Ubuntu](https://www.microsoft.com/en-us/p/ubuntu/9nblggh4msv6).

```sh
curl https://cdn.botframework.com/botframework-webchat/4.3.0/webchat.js | openssl dgst -sha384 -binary | openssl base64 -A
```

[This script](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity#Tools_for_generating_SRI_hashes) will fetch the asset from CDN, pipe it into OpenSSL for digest, and output as BASE64.

### Test locally

There are two public surfaces we need to test:

-  Embed page, i.e. https://webchat.botframework.com/embed/your-bot-id
-  Azure Portal "Test in Web Chat" blade

#### Testing the embed page

In order to test your local build, you can use Fiddler to modify the traffic to serve the Gemini page locally.

Append the following code in the FiddlerScript `OnBeforeRequest` function.

```js
if (oSession.uriContains('https://webchat.botframework.com/embed/your-bot-id/gemini')) {
   oSession['x-replywithfile'] =
      'C:\\Users\\JohnDoe\\Source\\Repos\\BotFramework-WebChat\\packages\\embed\\dist\\index.html';
   oSession['ui-backcolor'] = 'Yellow';
}
```

This code snippet will intercept all requests destinated to https://webchat.botframework.com/embed/your-bot-id/gemini. Instead of serving the request from webchat.botframework.com, with the script, Fiddler will serve the content from local file at C:\Users\JohnDoe\...\index.html instead.

#### Testing on Azure Portal

Until migration to v4 has completed worldwide, your bot may not immediately update to the new embed page on Azure Portal.

Append the following code in the FiddlerScript `OnPeekAtResponseHeaders` function. It will force your bot to use Gemini regardless of the deployment phase.

When combined with the FiddlerScript above, "Test in Web Chat" in Azure Portal will point to the locally-developed version of the Gemini page.

```js
if (oSession.uriContains('https://webchat.botframework.com/embed/your-bot-id?features=webchatpreview&t=')) {
   oSession['ui-backcolor'] = 'Yellow';
   oSession.oResponse.headers.HTTPResponseCode = 302;
   oSession.oResponse.headers.HTTPResponseStatus = '302 Moved';
   oSession.oResponse.headers.Add(
      'location',
      oSession.PathAndQuery.replace('your-bot-id?', 'your-bot-id/gemini?b=your-bot-id&v=4.3&')
   );
}
```

This code snippet will intercept requests to the original embed page and forward it to the new Gemini embed page.

## FAQs

Below are common questions about the new Gemini deployment of Web Chat.

### Why use `<iframe>` instead of other integration options?

Integrating Web Chat using `<iframe>` is the simplest way to connect your website with Azure Bot Services.

Although `<iframe>` does not support a wide variety of customization options, it helps you connect more easily by filling out options, such as bot avatar initials, user ID, etc. We also maintain versions for you to make sure your client is up-to-date and secure all the time.

### What version of Web Chat am I using on my site?

Press <kbd>F12</kbd> and look at the console. It should say something similar to the following:

```
Web Chat: Selecting version "default" -> "4" -> "4.3" -> "4.3.0".
```

In the above code, the version specifier is not specified. Web Chat is using the "default" version, which forwards to major version 4, then minor version 4.3, then patch version 4.3.0. You can select version by appending the URL query parameter `v` with the version number. For example, if you prefer 4.3, you should append `&v=4.3` to the URL.

### Why I am not seeing Web Chat v4 on my page?

Look at the console log on your web page by pressing <kbd>F12</kbd> to see view the version of Web Chat.

If you don't see the above line, this probably means that the new Gemini page has not completely rolled out. If your bot is using Gemini, the URL will be https://webchat.botframework.com/embed/your-bot-id/gemini. If your bot is not in, it will not have `/gemini` appended.

### I want to go back to previous versions of Web Chat

There are a handful of versions we support:

-  Majors
   -  `4` will serve the latest minor version of `4.*`. At the time this document was created, that version was `4.3.0`
   -  `3` will serve the latest minor version of `0.*`.At the time this document was created, it is `0.15.1-v3.748a85f`
   -  `scorpio` will serve the version before Gemini page was introduced. At the time this document was created, `scorpio` is version `0.11.4-ibiza.f373b1d`
      -  This is the as having the "Enable preview" checkbox checked
   -  `aries` will serve the version before Gemini page was introduced
      -  This is the same as having the "Enable preview" checkbox unchecked
      -  This version will show a bot icon and welcome message at the top of the page
-  Minors
   -  `4.2` will serve the latest patch version of `4.2.*`. At the time this document was created, it is `4.2.0`

However, we do not support specifying patch versions, e.g. `4.2.1`. This is because patch versions are for important security fixes. We will roll it out to users who are on the same minor version and we guarantee that security fixes will not introduce breaking changes.

### I really don't like the versioning system

We understand that sometimes, you will want to lock down to every single bit of code. Feel free to clone our code and build your own copy. This will ensure that your bits are locked down and controlled by your system. But it also means we will not be able to serve you any new features or security fixes.

### How does staged deployment work?

From time to time, when we release a new version of Web Chat, we will update the servicing plan in this repository and upload it to our server. This gives our users transparency on when we push out a new version and how it is done.

We gradually migrate customers' sites to our new version using a mechanism we call a dial. When we finish turning the dial from 0% to 100%, all customers have been switched to the latest version. We can also cherry-pick specific sites into specific version, or out.

### What URL parameters are supported?

| URL parameters     | Notes                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `?b=`              | Bot ID                                                                                                    |
| `?l=ja.ja-jp`      | Language to use, in Azure locale format (first part is localization, second part is internationalization) |
| `?l=zh-HK`         | Language to use, in ISO format                                                                            |
| `?s=`              | Secret for accessing the bot. If token is specified, this will be ignored                                 |
| `?t=`              | Token for accessing the bot                                                                               |
| `?userid=dl_12345` | User ID to use when sending the activity. If user ID is available in token, this will be ignored          |
| `?username=WW`     | Username to show, only for v3 or lower                                                                    |
| `?v=4`             | Specify version                                                                                           |

### What is Gemini, Scorpio and Aries?

Historically, we use Zodiac signs as code name to version the embed page.

-  Gemini: the latest version of embed page
   -  Supports multiple versions of Web Chat, backwards- and forwards-compatible
      -  Latest version is maintained at [`botframework-webchat@latest`](https://www.npmjs.com/package/botframework-webchat/)
      -  v3 is maintained at [`botframework-webchat@legacy`](https://www.npmjs.com/package/botframework-webchat/v/legacy), latest is 0.15.1
   -  Supports falling back to previous versions of embed page include Scorpio and Aries
-  Scorpio: Web Chat v3 of version 0.11.4
   -  Adaptive Cards 0.6.1
   -  OAuth card is not supported
   -  This is maintained at [`botframework-webchat@ibiza`](https://www.npmjs.com/package/botframework-webchat/v/ibiza)
   -  Note: 0.11.4 is not the latest version of Web Chat v3, the latest is 0.15.1
-  Aries: Web Chat v1
   -  Written in ASP.NET and Angular
