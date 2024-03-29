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
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AboutComponent } from './about.component';
import { SituationModule } from './situations/situation.module';
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './page-not-found.component';
import { ApplicationManagementModule } from './application-management/application-management.module';
import { RepositoryModule } from './repository/repository.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { CoreModule } from './core/core.module';
import { AccordionModule, CardModule, ConfirmDialogModule, GrowlModule, PanelModule } from 'primeng/primeng';
import { NgReduxModule } from '@angular-redux/store';
import { NgReduxRouterModule } from '@angular-redux/router';
import { StoreModule } from './store/store.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TabMenuModule } from 'primeng/tabmenu';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './util/keycloak-init';
import { AuthInterceptor } from './services/auth-interceptor';

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        PageNotFoundComponent,
    ],
    imports: [
        AccordionModule,
        PanelModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        NgReduxModule,
        NgReduxRouterModule,
        GrowlModule,
        SituationModule,
        TabMenuModule,
        CardModule,
        ApplicationManagementModule,
        RepositoryModule,
        ConfigurationModule,
        CoreModule,
        StoreModule,
        ConfirmDialogModule,
        KeycloakAngularModule,

        // AppRoutingModule must be the last routing module
        AppRoutingModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initializeKeycloak,
            multi: true,
            deps: [KeycloakService]
        }, {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
