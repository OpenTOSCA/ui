import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode }         from '@angular/core';

import './scss/app.scss';
import './scss/loader.scss';

import { AppModule } from './app';

if (process.env.ENV === 'production') {
  enableProdMode();
}

if (module['hot']) {
  console.log('Enable hot module replacement (HMR)...');
  module['hot'].accept();
}

platformBrowserDynamic().bootstrapModule(AppModule);
