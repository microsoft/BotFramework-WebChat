# Web Chat notes

## Goals

Listed in decreasing order of importance. Another way to think about this list is as a possible series of releases. 

1. iframed single-page web app hosted at a single URL, communicating with bot framework server via DirectLine REST API.
2. Open source, so that anyone could modify and host it, and point the iframe at their own version
3. Componentized so that someone running a compatible framework could include it directly on their site
4. Multiple components for multiple frameworks, sharing as much code as possible

## Invocation

    <iframe src="path/to/embed/TestBot?s=APP_SECRET'></iframe>

May add skinning parameters

* css=STYLESHEET-PATH
* l=LOCALIZATION-PATH
* ... and possibly other metadata like icon and title

## Features

### Styling

A major goal for this app is to allow full styling by customers, including
* Colors of all elements
* Typeface & size of all text
* Custom text 

## Language & Frameworks

[TypeScript](https://www.typescriptlang.org), natch.

The view engine is [React](https://facebook.github.io/react/).

Currently reliant on [RxJS](http://reactivex.io/rxjs) but contemplating switching to the smaller [xstream](https://github.com/staltz/xstream). 

## Dependencies

### Dev

* TypeScript

### Libraries

* React (loaded as a global at runtime)
* RxJS (currently bundled)

### Polyfills

* [Promise](https://github.com/then/promise)

## Non-Dependencies

## Building & Bundling

We'll [Webpack](http://webpack.github.io) things together using [ts_loader](https://github.com/TypeStrong/ts-loader) into a bundle.js.

Certain libraries -- currently React -- will be loaded as globals at runtime so that browsers have the opportunity to cache them.

## Deployment

No idea right now. If this is meant to be used in production by customers then I'm particularly concerned about notifying them and/or their users about downtime.
That said, the system is built to ressurect chat sessions, so a refresh need not be debilitating, just surprising.  

### Hot Loading

Don't know much about this. Sounds promising.

## To Do

### Bugs

### Questions

### AppState 

### Testing

* What test framework?

* Test versions of the directLine APIs that allow us to inject in static test data
* Multiple test scenarios, e.g. "reconstruct a large chat session"
* For each scenario, call test APIs with test data and check the resultant app state

## Implementation Theories

## Changes needed/wanted in DirectLine

* More efficient message passing (probably WebSocket)
* A way to reconcile incoming versions of messages we've already sent, so that we know whether or not to show them
* Possibly some metadata when creating a conversation, e.g. icon, title
