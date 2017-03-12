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
 *     Karoline Saatkamp - initial implementation
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
import { ApplicationInstanceDetailsComponent } from './application-instance-details/application-instance-details.component';
import { ApplicationsOverviewComponent } from './applications-overview/applications-overview.component';
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';

import { AdministrationService } from './administration/administration.service';
import { ApplicationService } from './shared/application.service';
import { MarketplaceService } from './shared/marketplace.service';

import { SortPipe } from './shared/sort/sort.pipe';

import { routing } from './app.routing';

import { Ng2BootstrapModule } from 'ng2-bootstrap';
import { NgUploaderModule } from 'ngx-uploader';
import { NgSpinKitModule } from 'ng-spin-kit';
import {GrowlModule} from 'primeng/primeng';

import { NgReduxModule, NgRedux } from 'ng2-redux';
import { OpenTOSCAUiActions } from './redux/actions';
import { AppState, INITIAL_STATE } from './redux/store';
import { rootReducer } from './redux/rootReducer.reducer';
import { ApplicationDetailResolver } from './application-details/application-detail-resolver.service';
import { ApplicationInstancesListComponent } from './application-instances-list/application-instances-list.component';
import { GrowlMessageBusService } from './shared/growl-message-bus.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        GrowlModule,
        HttpModule,
        NgReduxModule,
        Ng2BootstrapModule.forRoot(),
        routing,
        NgSpinKitModule,
        NgUploaderModule
    ],
    declarations: [
        AboutComponent,
        AdministrationComponent,
        AppComponent,
        ApplicationsComponent,
        ApplicationDetailsComponent,
        ApplicationInstancesComponent,
        ApplicationInstancesListComponent,
        ApplicationInstanceDetailsComponent,
        ApplicationsOverviewComponent,
        ApplicationUploadComponent,
        BreadcrumbComponent,
        MarketplaceComponent,
        SortPipe
    ],
    providers: [
        AdministrationService,
        ApplicationDetailResolver,
        ApplicationService,
        GrowlMessageBusService,
        MarketplaceService,
        OpenTOSCAUiActions
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule {
    constructor(ngRedux: NgRedux<AppState>) {
        ngRedux.configureStore(rootReducer, INITIAL_STATE, []);
    }
}
