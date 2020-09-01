# Content Security Policy

Starting from 4.10.1, [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) is supported.

> In this article, we are using a nonce of `a1b2c3d`. In production system, it should be a random and unguessable value that would change every time a policy is applied.

To enable Web Chat in a CSP-enforced environment, the following directives must be configured:

```
connect-src https://directline.botframework.com wss://directline.botframework.com; img-src blob:; script-src 'strict-dynamic'; style-src 'nonce-a1b2c3d'
```

For example, in a strict CSP environment, the basic policy should be:

<!-- prettier-ignore-start -->
```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; base-uri 'none'; connect-src https://directline.botframework.com wss://directline.botframework.com; img-src blob:; script-src 'strict-dynamic'; style-src 'nonce-a1b2c3d'"
/>
```
<!-- prettier-ignore-end -->

> Additional source for `script-src` will be needed depends on whether nonce or `'self'` is used to load Web Chat.

Additional directives may be needed to operate the bot properly. For example, if the bot would display an image, an additional `img-src` directive may be added to allow images from a different domain.

## Explanation of directives

- `default-src 'none'`
  - For strict CSP: deny access unless otherwise specified
- `base-uri 'none'`
  - For strict CSP: deny rebasing URIs using the [`<base>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)
- `connect-src https://directline.botframework.com wss://directline.botframework.com`
  - This is for Direct Line channel via Web Socket
  - REST call to https://directline.botframework.com for starting conversation, posting activities, etc.
  - Web Socket connection to wss://directline.botframework.com for receiving activities
- `img-src blob:`
  - `blob:` will allow some inlined images in Web Chat to be loaded via `blob:` scheme. For example, connectivity status spinner and typing indicator
    - You can use `styleOptions` to load these images from your source and modify this directive as needed
- `script-src 'nonce-a1b2c3d' 'strict-dynamic' 'unsafe-eval'`
  - `nonce-a1b2c3d` will allow JavaScript code through this nonce. This should be a per-policy, unique, and unguessable value
    - When loading Web Chat using CDN, you should provide this nonce, for example, `<script nonce="a1b2c3d" src="https://cdn.botframework.com/...">`
  - `strict-dynamic` will allow Web Chat to use Web Worker to downscale image on upload
  - (TODO: Remove this line) `unsafe-eval` will allow Direct Line chat adapter (a.k.a. `botframework-directlinejs`) to continue to work
- `style-src 'nonce-a1b2c3d'`
  - `'nonce-a1b2c3d'` will allow CSS injection through this nonce. This should be a per-policy, unique, and unguessable value
  - Web Chat inject `<style>` element using [`emotion`](https://emotion.sh/) with `nonce` attribute
  - You will need to pass this nonce when rendering Web Chat

(TODO: Remove `unsafe-eval`)

## Setting up the nonce

When rendering Web Chat, pass the nonce as a prop named `nonce`.

```js
WebChat.renderWebChat({
  directLine: createDirectLine({ token }),
  nonce: 'a1b2c3d'
});
```

## Limitations

Currently, the nonce is used for injecting `<style>` elements only. It is not used for other elements, including `<img>` and other media elements.

## Additional context

Please refer to [Content Security Policy sample](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/j.bundle-with-content-security-policy/) for a hosted live demo.
