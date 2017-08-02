# OpenTOSCA UI

[![Build Status](https://travis-ci.org/OpenTOSCA/ui.svg?branch=master)](https://travis-ci.org/OpenTOSCA/ui)

Part of the [OpenTOSCA Ecosystem](http://www.opentosca.org)

## Prerequisites

1. Install [Git](https://git-scm.com)
2. Install and setup [Node.js](https://nodejs.org/en/) > 6.9.0 and [NPM](https://www.npmjs.com) > 3 for [Angular.io](https://angular.io/docs/ts/latest/quickstart.html)
3. Install angular-cli `npm install -g @angular/cli`
4. Install proper [node-gyp](https://github.com/nodejs/node-gyp) dependencies for your OS (e.g. for Windows: `npm install --global --production windows-build-tools`)

## Local Development Setup

1. `git clone https://github.com/OpenTOSCA/ui.git opentosca-ui && cd opentosca-ui`
2. `npm install`

## Run Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

> **Note:** Be sure that no other process is listening on port 4200.
> You can change the port in the **defaults** object in `.angular-cli.json`.

## Production Build

After step 2 at setting up your local development environment:

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Lint the TypeScript project

```shell
ng lint
```

## Build the WAR archive

1. `mvnw clean package`

Copy the WAR archive from Maven's build output directory (`build\target`) to your Apache Tomcat server instance.


## Code scaffolding

Use angular-cli to generate new files!

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## License

Copyright (c) 2016-2017 University of Stuttgart.

All rights reserved. This program and the accompanying materials
are made available under the terms of the [Eclipse Public License v1.0]
and the [Apache License v2.0] which both accompany this distribution,
and are available at http://www.eclipse.org/legal/epl-v10.html
and http://www.apache.org/licenses/LICENSE-2.0

 [Apache License v2.0]: http://www.apache.org/licenses/LICENSE-2.0.html
 [Eclipse Public License v1.0]: http://www.eclipse.org/legal/epl-v10.html
