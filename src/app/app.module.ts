import {BrowserModule} from '@angular/platform-browser';
import {FormsModule}   from '@angular/forms';
import {HttpModule} from '@angular/http';
import {NgModule}      from '@angular/core';

import './rxjs-extensions';

import {InMemoryWebApiModule} from 'angular-in-memory-web-api';
import {InMemoryDataService} from './shared/in-memory-data.service';

import {AboutComponent} from "./about/about.component";
import {ApplicationsComponent} from "./applications/applications.component";
import {ApplicationDetailsComponent} from "./application-details/application-details.component";
import {ApplicationUploadComponent} from "./application-upload/application-upload.component";
import {MainNavComponent}  from './nav/main-nav.component';
import {MarketplaceComponent} from "./marketplace/marketplace.component";

import {routing} from "./app.routing";

import {ApplicationService} from "./shared/application.service";
import {Ng2BootstrapModule} from "ng2-bootstrap/ng2-bootstrap";
import {UPLOAD_DIRECTIVES} from "ng2-uploader/ng2-uploader";
import {FoldingCubeComponent, CircleComponent} from 'ng2-spin-kit/app/spinners';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        InMemoryWebApiModule.forRoot(InMemoryDataService, {passThruUnknownUrl: true}),
        Ng2BootstrapModule,
        routing
    ],
    declarations: [
        AboutComponent,
        ApplicationsComponent,
        ApplicationDetailsComponent,
        ApplicationUploadComponent,
        MarketplaceComponent,
        MainNavComponent,

        CircleComponent,
        UPLOAD_DIRECTIVES,
        FoldingCubeComponent
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
