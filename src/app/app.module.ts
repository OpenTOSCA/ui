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
import {ApplicationUploadComponent} from "./application-upload/application-upload.component";
import {Ng2BootstrapModule} from "ng2-bootstrap/ng2-bootstrap";
import {UPLOAD_DIRECTIVES} from "ng2-uploader/ng2-uploader";
import {FoldingCubeComponent, CircleComponent} from 'ng2-spin-kit/app/spinners';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        InMemoryWebApiModule.forRoot(InMemoryDataService),
        Ng2BootstrapModule,
        routing
    ],
    declarations: [
        MainNavComponent,
        ApplicationUploadComponent,
        ApplicationsComponent,
        ApplicationDetailsComponent,
        MarketplaceComponent,
        UPLOAD_DIRECTIVES,
        FoldingCubeComponent,
        CircleComponent
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
