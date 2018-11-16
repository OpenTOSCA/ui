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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevToolsExtension, NgRedux, NgReduxModule } from '@angular-redux/store';
import { NgReduxRouter, NgReduxRouterModule } from '@angular-redux/router';
import { createLogger } from 'redux-logger';
import { AppState } from './app-state.model';
import { rootReducer } from './store.reducer';
import { INITIAL_STATE as ApplicationManagementInitialState } from '../application-management/application-management.reducer';
import { INITIAL_STATE as ConfigurationInitialState } from '../configuration/configuration.reducer';
import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';

@NgModule({
    imports: [
        CommonModule,
        NgReduxModule,
        NgReduxRouterModule.forRoot()
    ],
    declarations: []
})
export class StoreModule {

    constructor(public store: NgRedux<AppState>, devTools: DevToolsExtension, ngReduxRouter: NgReduxRouter) {

        const engine = createEngine('opentosca');
        const storageMiddleware = storage.createMiddleware(engine);

        store.configureStore(
            rootReducer,
            {
                container: ApplicationManagementInitialState,
                administration: ConfigurationInitialState
            },
            [storageMiddleware, createLogger()],
            devTools.isEnabled() ? [devTools.enhancer()] : []);
        // Enable syncing of Angular router state with our Redux store.
        ngReduxRouter.initialize();
    }
}
