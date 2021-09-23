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
                        url: ``
                    }],
                    planLifecycleInterface: 'OpenTOSCA-Lifecycle-Interface',
                    planOperationInitiate: 'initiate',
                    planOperationTerminate: 'terminate',
                },
                repository: {
                    selectedRepository: {
                        name: 'OpenTOSCA',
                        url: ``
                    }
                },
            },
            [createLogger()],
            storeEnhancers,
        );
        // Enable syncing of Angular router state with our Redux store.
        ngReduxRouter.initialize();

        // loads hosts and ports from config file
        http.get("assets/config.json").subscribe((conf: any) => {
            // gets values from response or uses default value
            let api_endpoint_host: String = ((conf.API_ENDPOINT_HOST === "") ? `${this.document.location.hostname}` : conf.API_ENDPOINT_HOST);
            let api_endpoint_port: String = ((conf.API_ENDPOINT_PORT === "") ? "1337" : conf.API_ENDPOINT_PORT);
            let winery_host: String = ((conf.WINERY_HOST === "") ? `${this.document.location.hostname}` : conf.WINERY_HOST);
            let winery_port: String = ((conf.WINERY_PORT === "") ? "8080" : conf.WINERY_PORT);

            store.dispatch(ConfigurationActions.updateContainerUrl(`http://` + api_endpoint_host + `:` + api_endpoint_port));
            store.dispatch(ConfigurationActions.updateRepositoryItems([{
                name: 'OpenTOSCA',
                url: `http://` + winery_host + `:` + winery_port + `/winery/servicetemplates/`
            }]));
            store.dispatch(RepositoryActions.setSelectedRepository({
                name: 'OpenTOSCA',
                url: `http://` + winery_host + `:` + winery_port + `/winery/servicetemplates/`
            }));
        });
    }
}
