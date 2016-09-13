import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule}   from '@angular/forms';
import {HttpModule} from '@angular/http';

import './rxjs-extensions';

import {InMemoryWebApiModule} from 'angular2-in-memory-web-api';
import {InMemoryDataService} from './shared/in-memory-data.service';

import {MainNavComponent}  from './nav/main-nav.component';
import {ApplicationsComponent} from "./applications/applications.component";
import {routing} from "./app.routing";
import {MarketplaceComponent} from "./marketplace/marketplace.component";
import {ApplicationDetailsComponent} from "./application-details/application-details.component";
import {ApplicationService} from "./shared/application.service";


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        InMemoryWebApiModule.forRoot(InMemoryDataService),
        routing
    ],
    declarations: [
        MainNavComponent,
        ApplicationsComponent,
        ApplicationDetailsComponent,
        MarketplaceComponent
    ],
    providers: [
        ApplicationService
    ],
    bootstrap: [
        MainNavComponent
    ]
})
export class AppModule {
}
