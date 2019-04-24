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
