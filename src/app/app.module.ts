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
 *     Michael Wurster - initial implementation
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './page-not-found.component';
import { ApplicationManagementModule } from './application-management/application-management.module';
import { RepositoryManagementModule } from './repository-management/repository-management.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { CoreModule } from './core/core.module';
import { AccordionModule, GrowlModule } from 'primeng/primeng';

import { NgReduxModule } from '@angular-redux/store';
import { NgReduxRouterModule } from '@angular-redux/router';
import { StoreModule } from './store/store.module';

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        PageNotFoundComponent,
    ],
    imports: [
        AccordionModule,
        BrowserModule,
        FormsModule,
        HttpModule,
        GrowlModule,
        NgReduxModule,
        NgReduxRouterModule,
        ApplicationManagementModule,
        RepositoryManagementModule,
        ConfigurationModule,
        CoreModule,
        StoreModule,
        AppRoutingModule, // this must be the last routing module, because it contains '' and ** routing
    ],
    providers: [],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
