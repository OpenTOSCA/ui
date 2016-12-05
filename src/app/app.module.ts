/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule }      from '@angular/core';

import { AboutComponent } from './about/about.component';
import { AppComponent }  from './app.component';
import { ApplicationsComponent } from './applications/applications.component';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { ApplicationInstancesComponent } from "./application-instances/application-instances.component";
import { ApplicationUploadComponent } from './application-upload/application-upload.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';

import { ApplicationService } from './shared/application.service';
import { MarketplaceService } from './shared/marketplace.service';

import { routing } from './app.routing';

import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { UPLOAD_DIRECTIVES } from 'ng2-uploader/ng2-uploader';
import { AdministrationComponent } from './administration/administration.component';
import { AdministrationService } from './administration/administration.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        Ng2BootstrapModule,
        routing
    ],
    declarations: [
        AboutComponent,
        AdministrationComponent,
        AppComponent,
        ApplicationsComponent,
        ApplicationDetailsComponent,
        ApplicationInstancesComponent,
        ApplicationUploadComponent,
        MarketplaceComponent,
        UPLOAD_DIRECTIVES
    ],
    providers: [
        ApplicationService,
        AdministrationService,
        MarketplaceService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
