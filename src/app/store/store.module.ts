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
import { Inject, NgModule } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { DevToolsExtension, NgRedux, NgReduxModule } from '@angular-redux/store';
import { NgReduxRouter, NgReduxRouterModule } from '@angular-redux/router';
import { createLogger } from 'redux-logger';
import { AppState } from './app-state.model';
import { rootEnhancers, rootReducer } from './store.reducer';
import { HttpClient } from '@angular/common/http';
import { ConfigurationActions } from '../configuration/configuration-actions';
import { RepositoryActions } from '../repository/repository-actions.service';

@NgModule({
    imports: [
        CommonModule,
        NgReduxModule,
        NgReduxRouterModule.forRoot()
    ],
    declarations: []
})
export class StoreModule {

    constructor(public store: NgRedux<AppState>, devTools: DevToolsExtension, ngReduxRouter: NgReduxRouter,
        @Inject(DOCUMENT) private document: any, http: HttpClient) {
        const storeEnhancers = devTools.isEnabled() ? [...rootEnhancers, devTools.enhancer()] : [...rootEnhancers];
        store.configureStore(
            rootReducer,
            {
                administration: {
                    containerUrl: ``,
                    repositoryItems: [{
                        name: 'OpenTOSCA',
                        url: ``,
                        ui: ``
                    }],
                    planLifecycleInterface: 'OpenTOSCA-Lifecycle-Interface',
                    planOperationInitiate: 'initiate',
                    planOperationTerminate: 'terminate',
                },
                repository: {
                    selectedRepository: {
                        name: 'OpenTOSCA',
                        url: ``,
                        ui: ``
                    }
                },
            },
            [createLogger()],
            storeEnhancers,
        );
        // Enable syncing of Angular router state with our Redux store.
        ngReduxRouter.initialize();

        // loads hosts and ports from config file
        http.get('assets/config.json').subscribe((conf: any) => {
            // gets values from response or uses default value
            const API_ENDPOINT_HOST: String =
                ((conf.API_ENDPOINT_HOST === '') ? `${this.document.location.hostname}` : conf.API_ENDPOINT_HOST);
            const API_ENDPOINT_PORT: String = ((conf.API_ENDPOINT_PORT === '') ? '1337' : conf.API_ENDPOINT_PORT);
            const WINERY_HOST: String = ((conf.WINERY_HOST === '') ? `${this.document.location.hostname}` : conf.WINERY_HOST);
            const WINERY_PORT: String = ((conf.WINERY_PORT === '') ? '8080' : conf.WINERY_PORT);
            const WINERY_UI_ENDPOINT =   ((conf.WINERY_UI_ENDPOINT === '') ? `http://` + WINERY_HOST + `:` + WINERY_PORT + `/winery/servicetemplates/` : conf.WINERY_UI_ENDPOINT);

            store.dispatch(ConfigurationActions.updateContainerUrl(`http://` + API_ENDPOINT_HOST + `:` + API_ENDPOINT_PORT));
            store.dispatch(ConfigurationActions.updateRepositoryItems([{
                name: 'OpenTOSCA',
                url: `http://` + WINERY_HOST + `:` + WINERY_PORT + `/winery/servicetemplates/`,
                ui: WINERY_UI_ENDPOINT
            }]));
            store.dispatch(RepositoryActions.setSelectedRepository({
                name: 'OpenTOSCA',
                url: `http://` + WINERY_HOST + `:` + WINERY_PORT + `/winery/servicetemplates/`,
                ui: WINERY_UI_ENDPOINT
            }));
        });
    }
}
