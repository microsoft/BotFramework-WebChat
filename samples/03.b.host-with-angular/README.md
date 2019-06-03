# Sample - Integrating Web Chat using Angular 6+

> This is a great sample for first-time Web Chat users.

A simple web page with a WebChat in a flex-box maximized sidebar hosted using Angular.

# Test out the hosted sample

[Try out the Angular sample code here](https://stackblitz.com/github/omarsourour/ng-webchat-example)

# How to run locally

-  Fork the [repository containing the sample code.](https://github.com/omarsourour/ng-webchat-example)
-  Follow the README.md in the forked repo.

# Code

> The completed code can be found in the [sample repo.](https://github.com/omarsourour/ng-webchat-example)

## Goals of this sample

The sample repo has three main goals

-  Import WebChat into our Angular application.
   -  The manner in which the library is imported differs between Angular versions. Check the `CHANGELOG.md` file in the [sample repo](https://github.com/omarsourour/ng-webchat-example) for more information.
-  Create a WebChat container in a component template file.
-  Attach template container to a directline instance.

We'll start by adding the CDN to the head of our Angular application's `index.html` template.

`index.html`

```diff
…
<head>
+  <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
</head>
…
```

> For demonstration purposes, we are using the development branch of Web Chat at "/master/webchat.js". When you are using Web Chat for production, you should use the latest stable release at "/latest/webchat.js", or lock down on a specific version with the following format: "/4.1.0/webchat.js".

To create a WebChat container, create an empty `div` in the component's template file and assign it a template variable to reference it from this component's `.ts` file.

`app.component.html`

```diff
...
+ <div class="webchat-container" #botWindow></div>
...
```

Create a directline instance and attach it to the WebChat container via Angular's `ViewChild` construct.

`app.component.ts`

```ts
@ViewChild("botWindow") botWindowElement: ElementRef;

public ngOnInit(): void {
  const directLine = window.WebChat.createDirectLine({
    secret: "<YourSecretHere>",
    webSocket: false
  });

  window.WebChat.renderWebChat(
      {
          directLine: directLine,
          userID: "USER_ID"
      },
      this.botWindowElement.nativeElement
  );
}
```

> It is **never recommended** to put the Direct Line secret in the browser or client app. To learn more about secrets and tokens for Direct Line, visit [this tutorial on authentication](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication).

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
