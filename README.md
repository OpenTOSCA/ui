# OpenTOSCA UI

## Prerequisites
1. Install [git](https://git-scm.com)
2. Install and setup [Node.js](https://nodejs.org/en/) and [NPM](https://www.npmjs.com) for [Angular2](https://angular.io/docs/ts/latest/quickstart.html)

## Setup Local Development Server
1. `git clone git@gitlab-as.informatik.uni-stuttgart.de:smartservices/opentosca-ui.git`
2. `cd opentosca-ui`
3. `npm install`
4. `npm start` 
    - be sure that no other application is listening on port 3000
    - if you need to switch to another port adapt config/webpack.dev.js

## Production Build
Instead of step 4 do
5. `npm run build`
6. optional: if you want to serve the production build
    - `npm run build:serve`
    
## Just do Linting
7. `npm run lint`


## Generate OpenTOSCAUi.war
8. Do production build
7. `jar cvf OpenTOSCAUi.war ./dist`