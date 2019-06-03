# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

# Building the project

> If you need to build this project for customization purposes, we strongly advise you to refer to our [samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples). If you cannot find any samples that fulfill your customization needs and you don't know how to do that, please [send your dream to us](https://github.com/Microsoft/BotFramework-WebChat/issues/).
>
> Forking Web Chat to make your own customizations means you will lose access to our latest updates. Maintaining forks also introduces chores that are substantially more complicated than a version bump.

To build Web Chat, you will need to make sure both your Node.js and NPM is latest version (either LTS or current).

```sh
npm install
npm run bootstrap
npm run build
```

## Build tasks

There are 3 types of build tasks in the build process.

-  `npm run build`: Build for development (instrumented code for code coverage)
   -  Will bundle as `webchat-instrumented*.js`
-  `npm run watch`: Build for development with watch mode loop
-  `npm run prepublishOnly`: Build for production
   -  Will bundle as `webchat*.js`

## Testing Web Chat for development purpose

We built a playground app for testing Web Chat so we can test certain Web Chat specific features.

```sh
cd packages/playground
npm start
```

Then browse to http://localhost:3000/, and click on one of the connection options on the upper right corner.

-  Official MockBot: we hosted a live demo bot for testing Web Chat features
-  Emulator Core: it will connect to http://localhost:5000/v3/directline for [emulated Direct Line service](https://github.com/Microsoft/BotFramework-Emulator/tree/master/packages/emulator/cli/)

You are also advised to test the CDN bundles by copying the test harness from our samples.

## Building CDN bundle in development mode

Currently, the standard build script does not build the CDN bundle (`webchat*.js`).

```sh
cd packages/bundle
npm run watch
```

> By default, this script will run in watch mode.

## Building CDN bundle in production mode

If you want to build a production CDN bundle with minification, you can follow these steps.

```sh
cd packages/bundle
npm run prepublishOnly
```
