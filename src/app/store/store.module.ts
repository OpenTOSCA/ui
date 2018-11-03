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
import { CommonModule } from '@angular/common';
import { NgReduxModule, NgRedux, DevToolsExtension } from '@angular-redux/store';
import { NgReduxRouterModule, NgReduxRouter } from '@angular-redux/router';

// Redux ecosystem stuff.
import { createLogger } from 'redux-logger';
import { AppState } from './app-state.model';
import { rootReducer } from './store.reducer';
import { INITIAL_STATE as ApplicationManagementInitialState } from '../application-management/application-management.reducer';
import { INITIAL_STATE as ConfigurationInitialState } from '../configuration/configuration.reducer';
import { DOCUMENT } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        NgReduxModule,
        NgReduxRouterModule.forRoot()
    ],
    declarations: []
})
export class StoreModule {
    constructor(public store: NgRedux<AppState>,
                devTools: DevToolsExtension,
                ngReduxRouter: NgReduxRouter,
                @Inject(DOCUMENT) private document: any
    ) {
        // Tell Redux about our reducers. If the Redux DevTools
        // chrome extension is available in the browser, tell Redux about
        // it too.
        const configState = ConfigurationInitialState;
        configState.containerAPI = `http://${this.document.location.hostname}:1337`;
        configState.repositoryAPI = `http://${this.document.location.hostname}:8080/winery/servicetemplates/`;
        store.configureStore(
            rootReducer,
            {
                container: ApplicationManagementInitialState,
                administration: configState
            },
            [ createLogger() ],
            devTools.isEnabled() ? [ devTools.enhancer() ] : []);

        // Enable syncing of Angular router state with our Redux store.
        ngReduxRouter.initialize();
    }
}
