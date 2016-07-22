# Web Chat notes

## Goals

Listed in decreasing order of importance. Another way to think about this list is as a possible series of releases. 

1. iframed single-page web app hosted at a single URL, communicating with bot framework server via DirectLine REST API.
2. Open source, so that anyone could modify and host it, and point the iframe at their own version
3. Componentized so that someone running a compatible framework could include it directly on their site
4. Multiple components for multiple frameworks, sharing as much code as possible

## Invocation

    <iframe src="path/to/embed/TestBot?s=APP_SECRET'></iframe>

## Features

### Styling

A major goal for this app is to allow full styling by customers, including
* Colors of all elements
* Typeface & size of all text
* Custom text 

## Language & Frameworks

[TypeScript](https://www.typescriptlang.org), natch.

The view engine is [React](https://facebook.github.io/react/).

I'm going to start out with [RxJS](http://reactivex.io/rxjs) and see how far it takes us. 

## Dependencies

### Dev

* TypeScript

### Libraries

* React
* RxJS 

### Polyfills

## Non-Dependencies

## Building & Bundling

We'll [Webpack](http://webpack.github.io) everything together using [ts_loader](https://github.com/TypeStrong/ts-loader) into a bundle.js.

## Deployment

No idea right now. If this is meant to be used in production by customers I'm particularly concerned about notifying them and/or their users about downtime.
That said, the system is built to ressurect chat sessions, so a refresh need not be debilitating, just surprising.  

### Hot Loading

Don't know much about this. Sounds promising.

## To Do

### Bugs

### Questions

### AppState 

* Start a theory about using scan() to turn getMessages into the state we'll render
* How efficient is that? Will it make new state even when nothing changes?

### Testing

* What test framework?

* Test versions of the directLine APIs that allow us to inject in static test data
* Multiple test scenarios, e.g. "reconstruct a large chat session"
* For each scenario, call test APIs with test data and check the resultant app state

## Implementation Theories

We combine Incoming Messages with Outgoing Messages
Outgoing messages that are also Incoming are de-duped (the incoming version wins)
The remaining Outgoing messages are shown last, in the order "sent". We indicate that they are still pending.

