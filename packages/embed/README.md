# botframework-webchat-embed

This package contains the source code for the embed page at https://webchat.botframework.com/.

> For transparency and completeness, we are maintaining the code in the Web Chat repository. This code is coupled to our servers. In order to host this page on your own website, you will need to decouple it or provide the same set of REST APIs.

## Background

Web Chat offers multiple levels of integration options. In this package, we focus on embedding an `<iframe>` element in your web page.

`<iframe>` is the simplest way to connect your website to Azure Bot Services. If you prefer more advanced features or customization options, please refer to the [migration guide](https://github.com/microsoft/botframework-webchat/blob/master/README.md#migrating-from-v3-to-v4-of-web-chat) for details.

There are a few features unique to `<iframe>`:

-  Reading configurations from Azure Bot Services
-  Simplified version selection
   -  Based on the versions you selected (latest, specific major, or specific minor), the most recent Web Chat client of that major and minor version will be served with the latest security fixes
   -  Please refer to the [I want to go back documentation](#i-want-to-go-back-to-previous-versions-of-web-chat) to specify the version you want to use
-  This creates the same experience as the "Test in Web Chat" blade in Azure Portal

## How to use

To use the embed page, you will need the site secret from your Azure Bot Services page. Once you have the secret, add the following to your page.

```html
<iframe src="https://webchat.botframework.com/embed/your-bot-id?s=your-site-secret"></iframe>
```

**For production use, we strongly recommend that you use token retrieval instead of your secret.** Please refer to [this article](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication) for how to generate token from your secret.

With a token (instead of a secret), your `<iframe>` will look like the following:

```html
<iframe src="https://webchat.botframework.com/embed/your-bot-id?t=your-site-token"></iframe>
```

Please refer to the [supported parameters](#what-url-parameters-are-supported) for list of URL parameters supported.

## Development

### Building the page

Follow the steps below to build the embed page locally.

1. `npm install`
1. `npm run prepublishOnly`
1. Publishes the build artifact at `/dist/index.html`
   1. Verifies the file size. It should be less than 30 KB

### Updating the servicing plan

`servicingPlan.json` is the deployment plan. It provides details about where to locate assets, how to set up, and when to deprecate our older bits.

When modifying the servicing plan to point to newer assets, make sure it is pointing to immutable copies on CDN. For example, you want to use assets with hashed filenames. Since Web Chat is using subresource integrity, this will make sure the servicing plan and assets can be invalidated on CDN cache asynchronously.

#### Generating hash for subresource integrity

For traceability of deployment, Web Chat uses [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).

To generate SHA384 for a specific asset from an URL, run the following command in [Ubuntu](https://www.microsoft.com/en-us/p/ubuntu/9nblggh4msv6).

```sh
curl https://cdn.botframework.com/botframework-webchat/4.3.0/webchat.js | openssl dgst -sha384 -binary | openssl base64 -A
```

[Generating SRI hashes script](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity#Tools_for_generating_SRI_hashes) will fetch the asset from CDN, pipe it into OpenSSL for digest, and output as BASE64.

### Test locally

There are two public surfaces to test:

-  Embed page (i.e. https://webchat.botframework.com/embed/your-bot-id)
-  Azure Portal "Test in Web Chat" blade

#### Testing the embed page locally

In order to test your local build, you can use Fiddler to modify the traffic to serve the Web Chat page locally.

Append the following code in the FiddlerScript `OnBeforeRequest` function.

```js
if (oSession.uriContains('https://webchat.botframework.com/embed/your-bot-id/')) {
   oSession['x-replywithfile'] =
      'C:\\Users\\JohnDoe\\Source\\Repos\\BotFramework-WebChat\\packages\\embed\\dist\\index.html';
   oSession['ui-backcolor'] = 'Yellow';
}
```

This code snippet will intercept all requests designated for https://webchat.botframework.com/embed/your-bot-id/. Instead of serving the request from webchat.botframework.com, with the script, Fiddler will serve the content from your local file at C:\Users\JohnDoe\...\index.html instead.

#### Testing on Azure Portal

Append the following code in the FiddlerScript `OnPeekAtResponseHeaders` function. It will allow your local bot to use the latest (or your chosen version) of Web Chat, regardless of the deployment phase.

When combined with the FiddlerScript above, "Test in Web Chat" in Azure Portal will point to the locally-developed version of the Web Chat page.

```js
if (oSession.uriContains('https://webchat.botframework.com/embed/your-bot-id?features=webchatpreview&t=')) {
   oSession['ui-backcolor'] = 'Yellow';
   oSession.oResponse.headers.HTTPResponseCode = 302;
   oSession.oResponse.headers.HTTPResponseStatus = '302 Moved';
   oSession.oResponse.headers.Add(
      'location',
      oSession.PathAndQuery.replace('your-bot-id?', 'your-bot-id/?b=your-bot-id&v=4.3&')
   );
}
```

## FAQs

Below are common questions about the embed deployment of Web Chat.

### Why use `<iframe>` instead of other integration options?

Integrating Web Chat using `<iframe>` is the simplest way to connect your website with Azure Bot Services.

Although `<iframe>` does not support a wide variety of customization options, it helps you connect more easily by filling out options, such as bot avatar initials, user ID, etc. We also maintain versions for you to make sure your client is up-to-date and secure all the time.

### What version of Web Chat am I using on my site?

Press <kbd>F12</kbd> and look at the console. It should say something similar to the following:

```
Web Chat: Selecting version "default" -> "4" -> "4.3" -> "4.3.0".
```

Without manual configuration, Web Chat will use the "default" version, which forwards to major version (e.g. 4), then minor version (e.g. 4.3), then patch version (e.g. 4.3.0). You can select a version by appending the URL query parameter `v` with the version number. For example, if you prefer 4.3, you should append `&v=4.3` to the URL.

You can use `<iframe>` to host any published version 4.x of v4 Web Chat

### I want to go back to previous versions of Web Chat

You can specify any `<iframe>` 4.x version of Web Chat on your app.

-  Majors
   -  `4` will serve the latest minor version of `4.*`. At the time this document was created, that version was `4.3.0`
-  Minors
   -  `4.2` will serve the latest patch version of `4.2.*`. At the time this document was created, it is `4.2.0`
-  Other

   -  versions `3` and older are no longer available via embed. To use one of these versions on your app, please use the CDN of Web Chat in your HTML. See samples [01.a.getting-started-full-bundle](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.a.getting-started-full-bundle) and [01.c.getting-started-migration](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.c.getting-started-migration) to learn more.

   -  Pre-v3, legacy versions of Web Chat are maintained at [`botframework-webchat@legacy`](https://www.npmjs.com/package/botframework-webchat/v/legacy), latest is 0.15.1

Specifying patch versions (e.g. `4.2.1`) is not supported. This is because patch versions are for important security fixes. Patches will be rolled out to users who are on the same minor version, and we guarantee that security fixes will not introduce breaking changes.

### I really don't like the versioning system

Feel free to clone Web Chat's code and build your own copy if you prefer to be in complete control of your code. This will ensure that your bits are locked down by your system. But it also means your version of Web Chat will not receive any new features or security fixes.

### How does staged deployment work?

When a new version of Web Chat is released, the servicing plan in this repository will be updated and uploaded to the Bot Framework server. This gives users transparency on when a new version is pushed out and how it is done.

### What URL parameters are supported?

| URL parameters     | Notes                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `?b=`              | Bot ID                                                                                                    |
| `?l=ja.ja-jp`      | Language to use, in Azure locale format (first part is localization, second part is internationalization) |
| `?l=zh-HK`         | Language to use, in ISO format                                                                            |
| `?s=`              | Secret for accessing the bot. If token is specified, this will be ignored                                 |
| `?t=`              | Token for accessing the bot                                                                               |
| `?userid=dl_12345` | User ID to use when sending the activity. If user ID is available in token, this will be ignored          |
| `?username=WW`     | Username to show, only for v3 or lower. This parameter is accepted in v4, but will not be shown.          |
| `?v=4`             | Specify version                                                                                           |

### Embed history

-  Web Chat v4 embed supports multiple versions of Web Chat (backwards- and forwards-compatible)
   -  The latest version is maintained at [`botframework-webchat@latest`](https://www.npmjs.com/package/botframework-webchat/)
   -  v3 is maintained at [`botframework-webchat@legacy`](https://www.npmjs.com/package/botframework-webchat/v/legacy), and latest is 0.15
-  Legacy Web Chat 0.11.4:
   -  Uses Adaptive Cards 0.6.1
   -  OAuth card is not supported
   -  Is maintained at [`botframework-webchat@ibiza`](https://www.npmjs.com/package/botframework-webchat/v/ibiza)
   -  Note: 0.11.4 is not the latest version of Web Chat v3, the latest is 0.15.1
-  Web Chat v1 was written in ASP.NET and Angular
