/**
 * Copyright (c) 2017 University of Stuttgart.
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';

import { AboutComponent } from './about/about.component';
import { AdministrationComponent } from './administration/administration.component';
import { AppComponent }  from './app.component';
import { ApplicationsComponent } from './applications/applications.component';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { ApplicationUploadComponent } from './application-upload/application-upload.component';
import { ApplicationInstanceDetailsComponent } from './application-instance-details/application-instance-details.component';
import { ApplicationsOverviewComponent } from './applications-overview/applications-overview.component';
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';

import { AdministrationService } from './administration/administration.service';
import { ApplicationService } from './shared/application.service';
import { MarketplaceService } from './shared/marketplace.service';

import { SortPipe } from './shared/sort/sort.pipe';

import { routing } from './app.routing';

import { ProgressbarModule } from 'ngx-bootstrap';
import { AccordionModule as ngxAccordionModule } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap';
import { NgUploaderModule } from 'ngx-uploader';
import { NgSpinKitModule } from 'ng-spin-kit';
import { AccordionModule, FieldsetModule, GrowlModule, CodeHighlighterModule } from 'primeng/primeng';

import { NgRedux, NgReduxModule } from '@angular-redux/store';
import { OpenTOSCAUiActions } from './redux/actions';
import { AppState, INITIAL_STATE } from './redux/store';
import { rootReducer } from './redux/rootReducer.reducer';
import { ApplicationDetailsResolver } from './application-details/application-details-resolver.service';
import { ApplicationInstancesListComponent } from './application-instances-list/application-instances-list.component';
import { GrowlMessageBusService } from './shared/growl-message-bus.service';
import { MarketplacesComponent } from './marketplace/marketplaces.component';
import { MarketplaceOverviewComponent } from './marketplace-overview/marketplace-overview.component';
import { SharedModule } from 'primeng/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OpenToscaLogger } from './shared/util/OpenToscaLogger';
import { DatePipe } from '@angular/common';
import { ApplicationInstanceDetailsResolver } from './application-instance-details/application-instance-details-resolver.service';
import { ApplicationInstanceService } from './shared/application-instance.service';
import { ApplicationInstancesService } from './shared/application-instances.service';

@NgModule({
    imports: [
        AccordionModule,
        BrowserModule,
        BrowserAnimationsModule,
        CodeHighlighterModule,
        FieldsetModule,
        FormsModule,
        GrowlModule,
        HttpModule,
        NgReduxModule,
        ProgressbarModule.forRoot(),
        ngxAccordionModule.forRoot(),
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        routing,
        NgSpinKitModule,
        NgUploaderModule,
        ReactiveFormsModule,
        SharedModule
    ],
    declarations: [
        AboutComponent,
        AdministrationComponent,
        AppComponent,
        ApplicationsComponent,
        ApplicationDetailsComponent,
        ApplicationInstancesListComponent,
        ApplicationInstanceDetailsComponent,
        ApplicationsOverviewComponent,
        ApplicationUploadComponent,
        BreadcrumbComponent,
        MarketplacesComponent,
        MarketplaceOverviewComponent,
        SortPipe
    ],
    providers: [
        AdministrationService,
        ApplicationDetailsResolver,
        ApplicationInstanceDetailsResolver,
        ApplicationService,
        ApplicationInstanceService,
        ApplicationInstancesService,
        DatePipe,
        GrowlMessageBusService,
        MarketplaceService,
        OpenTOSCAUiActions,
        OpenToscaLogger
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
