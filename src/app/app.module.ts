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
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';

import { AboutComponent } from './about/about.component';
import { AdministrationComponent } from './administration/administration.component';
import { AppComponent }  from './app.component';
import { ApplicationsComponent } from './applications/applications.component';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { ApplicationInstancesComponent } from './application-instances/application-instances.component';
import { ApplicationUploadComponent } from './application-upload/application-upload.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';

import { AdministrationService } from './administration/administration.service';
import { ApplicationService } from './shared/application.service';
import { MarketplaceService } from './shared/marketplace.service';

import { SortPipe } from './shared/sort/sort.pipe';

import { routing } from './app.routing';

import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { UPLOAD_DIRECTIVES } from 'ng2-uploader/ng2-uploader';

import { NgReduxModule, NgRedux } from 'ng2-redux';
import { OpenTOSCAUiActions } from './redux/actions';
import { IAppState, INITIAL_STATE } from './redux/store';
import { rootReducer } from './redux/rootReducer.reducer';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        NgReduxModule,
        Ng2BootstrapModule.forRoot(),
        routing,
    ],
    declarations: [
        AboutComponent,
        AdministrationComponent,
        AppComponent,
        ApplicationsComponent,
        ApplicationDetailsComponent,
        ApplicationInstancesComponent,
        ApplicationInstanceDetailsComponent,
        ApplicationUploadComponent,
        MarketplaceComponent,
        SortPipe,
        UPLOAD_DIRECTIVES
    ],
    providers: [
        AdministrationService,
        ApplicationService,
        MarketplaceService,
        OpenTOSCAUiActions
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule {
    constructor(ngRedux: NgRedux<IAppState>) {
        ngRedux.configureStore(rootReducer, INITIAL_STATE, []);
    }
}
