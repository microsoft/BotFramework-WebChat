# botframework-webchat-embed

This package is the embed page hosting at https://webchat.botframework.com/.

For transparency and completeness, we are maintaining the code here. This code is coupled to our servers. In order to host this page, you will need to decouple it or provide the same set of REST APIs.

## Build

1. `npm install`
1. `npm run prepublishOnly`
1. Publishes the build artifact at `/dist/index.html`, to our internal repository
   1. Verifies the file size, it should be less than 30 KB

## Updating servicing plan

`servicingPlan.json` is the deployment plan. It provides details about where to locate assets, how to set up, and when to deprecate our older bits.

When modifying the servicing plan to point to newer assets, make sure it is pointing to immutable copies on CDN. For example, assets with hashed filenames. Since we are using subresource integrity, this will make sure servicing plan and assets can be invalidated on CDN cache asynchronously.

### Generating hash for subresource integrity

For traceability of deployment, we are using [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).

To generate SHA384 for a specific asset from an URL, run the following command in [Ubuntu](https://www.microsoft.com/en-us/p/ubuntu/9nblggh4msv6).

```sh
curl https://cdn.botframework.com/botframework-webchat/4.3.0/webchat.js | openssl dgst -sha384 -binary | openssl base64 -A
```

## Test locally

There are two public surfaces we need to test:

- Embed page, i.e. https://webchat.botframework.com/embed/your-bot-id
- Azure Portal "Test in Web Chat" blade

### Testing the embed page

In order to test your local build, you can use Fiddler to modify the traffic to serve the Gemini page locally.

Append the following code in the FiddlerScript `OnBeforeRequest` function.

```js
if (oSession.uriContains('https://webchat.botframework.com/embed/your-bot-id/gemini')) {
    oSession['x-replywithfile'] = 'C:\\Users\\JohnDoe\\Source\\Repos\\BotFramework-WebChat\\packages\\embed\\dist\\index.html';
    oSession["ui-backcolor"] = "Yellow";
}
```

### Testing on Azure Portal

Until migration to v4 has completed worldwide, your bot may not immediately update to the new embed page on Azure Portal.

Append the following code in the FiddlerScript `OnPeekAtResponseHeaders` function. It will force your bot to use Gemini regardless of the deployment phase.

When combined with the FiddlerScript above, "Test in Web Chat" in Azure Portal will point to the locally-developed version of the Gemini page.

```js
if (oSession.uriContains("https://webchat.botframework.com/embed/your-bot-id?features=webchatpreview&t=")) {
    oSession["ui-backcolor"] = "Yellow";
    oSession.oResponse.headers.HTTPResponseCode = 302;
    oSession.oResponse.headers.HTTPResponseStatus = '302 Moved';
    oSession.oResponse.headers.Add('location', oSession.PathAndQuery.replace('your-bot-id?', 'your-bot-id/gemini?b=your-bot-id&v=4.3&'));
}
```

## FAQs

These are common questions around the new Gemini page.

### What is the version of Web Chat I am using on my page?

Press <kbd>F12</kbd> and look at the console. It should say something similar to the following:

```
Web Chat: Selecting version "default" -> "4" -> "4.3" -> "4.3.0".
```

The line above means, the version specifier is not specified. And Web Chat use "default" version, which forward to major version 4, then minor version 4.3, then patch version 4.3.0.

### Why I am not seeing Web Chat v4 on my page?

Look at the <kbd>F12</kbd> console log and see how version selection is being done.

If you don't see the line, it is probably because the new Gemini page is not rolled out completely. If your bot is in, the URL should become https://webchat.botframework.com/embed/your-bot-id/gemini. If your bot is not in, it will not have `/gemini` appended.

### I want to go back to previous versions

There are a handful of versions we support:

- Majors
   - `4` will serve the latest minor version of `4.*`. As of time of this writing, it is `4.3.0`
   - `3` will serve the latest minor version of `0.*`. As of time of this writing, it is `0.15.1-v3.748a85f`
   - `scorpio` will serve the version before Gemini page is introduced. As of time of this writing, it is `0.11.4-ibiza.f373b1d`
      - This will be same as "Enable preview" checkbox checked
   - `aries` will serve the version before Gemini page is introduced
      - This will be same as "Enable preview" checkbox unchecked
      - This version will show a bot icon and welcome message on the top of the page
- Minors
   - `4.2` will serve the latest patch version of `4.2.*`. As of time of this writing, it is `4.2.0`

However, we do not support specifying patch versions, e.g. `4.2.1`. This is because patch versions are for important security fixes, we will roll it out to users who are on the same minor version and guarantee security fixes will not introduce breaking changes.

### I really don't like the versioning system

We understand that some time, you will want to lock down to every single bit of code. Feel free to clone our code and build your own copy. This will make sure your bits are locked down and controlled by your system. But it also means we will not be able to serve you any new features or security fixes.

### How staged deployment work?

From time to time, when we release new version of Web Chat, we will update the servicing plan in this repository and upload it to our server. It give our users transparency on when we push out a new version and how it is getting done.

Then, we gradually migrate sites to our new version using a mechanism we call dial. We turn the dial from 0% to 100%, then everyone will get the latest version. We can cherry-pick specific site into certain version, or out.

### What URL parameters are supported?

| URL parameters     | Notes                                                                                                     |
|--------------------|-----------------------------------------------------------------------------------------------------------|
| `?b=`              | Bot ID                                                                                                    |
| `?l=ja.ja-jp`      | Language to use, in Azure locale format (first part is localization, second part is internationalization) |
| `?l=zh-HK`         | Language to use, in ISO format                                                                            |
| `?s=`              | Secret for accessing the bot. If token is specified, this will be ignored                                 |
| `?t=`              | Token for accessing the bot                                                                               |
| `?userid=dl_12345` | User ID to use when sending the activity. If user ID is available in token, this will be ignored          |
| `?username=WW`     | Username to show, only for v3 or lower                                                                    |
| `?v=4`             | Specify version                                                                                           |
