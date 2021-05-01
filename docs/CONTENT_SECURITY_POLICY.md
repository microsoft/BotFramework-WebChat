# Content Security Policy

Starting from 4.10.1, [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) is supported.

> In this article, we are using a nonce of `a1b2c3d`. In a production system, it should be a random and unguessable value that changes every time a policy is applied.

To enable Web Chat in a CSP-enforced environment, the following directives must be configured:

```
connect-src https://directline.botframework.com wss://directline.botframework.com; img-src blob:; script-src 'strict-dynamic'; style-src 'nonce-a1b2c3d'
```

For example, in a strict CSP environment, the basic policy should be:

<!-- prettier-ignore-start -->
```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; base-uri 'none'; connect-src blob: https://directline.botframework.com wss://directline.botframework.com; img-src blob:; script-src 'strict-dynamic'; style-src 'nonce-a1b2c3d'"
/>
```
<!-- prettier-ignore-end -->

> Additional source for `script-src` will be needed depending on whether nonce or `'self'` source is used to load Web Chat.

Additional directives may be needed to operate the bot properly. For example, if the bot would display an image, an additional `img-src` directive may be added to allow images from a different domain. For details, please see [#3445](https://github.com/microsoft/BotFramework-WebChat/issues/3445.

## Explanation of directives

-  `default-src 'none'`
   -  For strict CSP: deny access unless otherwise specified
-  `base-uri 'none'`
   -  For strict CSP: deny rebasing URIs using the [`<base>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)
-  `connect-src blob: https://directline.botframework.com wss://directline.botframework.com`
   -  `blob:` is used for uploading attachments
   -  REST call to https://directline.botframework.com for starting conversation, posting activities, etc.
   -  Web Socket connection to wss://directline.botframework.com for receiving activities
   -  When using protocols other than Direct Line or Web Chat channel, the source will be different
-  `img-src blob:`
   -  `blob:` will allow images in Web Chat to be loaded via `blob:` scheme. Types of images using `blob:` scheme:
      -  Inlined assets. For example, connectivity status spinner and typing indicator
         -  You can use `styleOptions` to load these images from your source and modify this directive as needed
      -  Bot attached images using data URI, will be converted to URL with scheme of `blob:`
      -  User uploaded images are downscaled as thumbnails with scheme of `blob:`
-  `script-src 'strict-dynamic'`
   -  (Optional) `strict-dynamic` will allow Web Chat to use Web Worker to downscale image on upload
      -  If `strict-dynamic` is not provided, Web Chat will fallback to main thread to downscale image
-  `style-src 'nonce-a1b2c3d'`
   -  `'nonce-a1b2c3d'` will allow CSS injection through this nonce. This should be a per-policy, unique, and unguessable value
   -  Web Chat inject `<style>` element using [`emotion`](https://emotion.sh/) with `nonce` attribute
   -  You will need to pass this nonce when rendering Web Chat

## Setting up the nonce

When rendering Web Chat, pass the nonce as a prop named `nonce`.

```js
WebChat.renderWebChat({
   directLine: createDirectLine({ token }),
   nonce: 'a1b2c3d'
});
```

## Limitations

Currently, the nonce is used for injecting `<style>` elements only. It is not used for other elements, including `<img>` and other media elements. For details, please see [#3445](https://github.com/microsoft/BotFramework-WebChat/issues/3445.

## Nonce exposure

Any code executed inside Web Chat context could retrieve the nonce. When adding customization code to Web Chat, please make sure the nonce is not exposed.

## Additional context

Please refer to [Content Security Policy sample](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/j.bundle-with-content-security-policy/) for a hosted live demo.
