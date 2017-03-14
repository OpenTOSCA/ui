# OpenTOSCA UI

[![Build Status](https://travis-ci.org/OpenTOSCA/ui.svg?branch=master)](https://travis-ci.org/OpenTOSCA/ui)

Part of the [OpenTOSCA Ecosystem](http://www.opentosca.org)

## Prerequisites

1. Install [Git](https://git-scm.com)
2. Install and setup [Node.js](https://nodejs.org/en/) and [NPM](https://www.npmjs.com) for [Angular2](https://angular.io/docs/ts/latest/quickstart.html)
3. For Windows: `npm install --global --production windows-build-tools` (required by [node-gyp](https://github.com/nodejs/node-gyp))

## Local Development Setup

1. `git clone https://github.com/OpenTOSCA/ui.git opentosca-ui && cd opentosca-ui`
2. `npm install`
3. `npm start` 

> **Note:** Be sure that no other process is listening on port 3000.
> You can change the port in `config/webpack.dev.js`.

## Production Build

After step 3 at setting up your local development environment:

1. `npm run build`
2. Serve the production build: `npm run build:serve`

## Lint the TypeScript project

```shell
npm run lint
```

## Build the WAR archive

1. `mvnw clean package`

Copy the WAR archive from Maven's build output directory (`build\target`) to your Apache Tomcat server instance.
