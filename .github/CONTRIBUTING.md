# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

# Building the project

> If you need to build this project for customization purposes, we strongly advise you to refer to our [samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples). If you cannot find any samples that fulfill your customization needs and you don't know how to do that, please [send your dream to us](https://github.com/microsoft/BotFramework-WebChat/issues/).
>
> Forking Web Chat to make your own customizations means you will lose access to our latest updates. Maintaining forks also introduces chores that are substantially more complicated than a version bump.

To build Web Chat, you will need to make sure both your Node.js and NPM is latest version (either LTS or current, must be `>= 12`).

## Preparing the build

After you clone the repository, run the following to make sure all dependencies were installed.

```sh
npm ci
npm run bootstrap
```

## Build tasks

You can use either one of the following scripts to build Web Chat:

-  `npm run build` will build once
-  `npm start` will build and continuously rebuild if changes are detected

## Trying out the build

Web Chat's playground app under `/packages/` is for testing and debugging.

```sh
cd packages/playground
npm run start
```

Then navigate to http://localhost:3000/, and click on one of the connection options on the upper right corner.

-  Official MockBot: we hosted a live demo bot for testing Web Chat features
-  Emulator Core: it will connect to http://localhost:5000/v3/directline for [emulated Direct Line service](https://github.com/microsoft/BotFramework-Emulator/tree/master/packages/emulator/cli/)

You are also advised to test the CDN bundles by copying the test harness from our samples.

## Running integration tests

```bash
docker-compose up --build --detach
npm test
docker-compose down --rmi all
```

## Static code analysis

Before committing code, please run the following command:

```
npm run eslint
```

eslint and prettier will ensure that your code follows our linting guidelines without too much effort. If you have any questions about this process, please feel free to leave comments in your Pull Request.

## Adding languages

To add a new language to our localization list, please refer to [`docs/LOCALIZATION.md`](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/LOCALIZATION.md).
