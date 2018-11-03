/*
 * Copyright (c) 2018 University of Stuttgart.
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './page-not-found.component';
import { ApplicationManagementModule } from './application-management/application-management.module';
import { RepositoryManagementModule } from './repository-management/repository-management.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { CoreModule } from './core/core.module';
import { AccordionModule, CardModule, GrowlModule } from 'primeng/primeng';
import { NgReduxModule } from '@angular-redux/store';
import { NgReduxRouterModule } from '@angular-redux/router';
import { StoreModule } from './store/store.module';
import { HttpClientModule } from '@angular/common/http';
// PrimeNG Stuff
import {TabMenuModule} from 'primeng/tabmenu';

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
        HttpClientModule,
        NgReduxModule,
        NgReduxRouterModule,
        GrowlModule,
        TabMenuModule,
        CardModule,
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
