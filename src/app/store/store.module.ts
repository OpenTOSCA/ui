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
                @Inject(DOCUMENT) private document: any) {
        const storeEnhancers = devTools.isEnabled() ? [...rootEnhancers, devTools.enhancer()] : [...rootEnhancers];
        store.configureStore(
            rootReducer,
/*             {
                administration: {
                    containerUrl: `http://${this.document.location.hostname}:1337`,
                    repositoryItems: [{
                        name: 'OpenTOSCA',
                        url: `http://${this.document.location.hostname}:8080/winery/servicetemplates/`
                    }],
                    planLifecycleInterface: 'OpenTOSCA-Lifecycle-Interface',
                    planOperationInitiate: 'initiate',
                    planOperationTerminate: 'terminate',
                },
                repository: {
                    selectedRepository: {
                        name: 'OpenTOSCA',
                        url: `http://${this.document.location.hostname}:8080/winery/servicetemplates/`
                    }
                },
            }, */
            {
                administration: {
                    containerUrl: `http://${this.document.location.hostname}:1337`,
                    repositoryItems: [{
                        name: 'OpenTOSCA',
                        url: `http://192.168.99.100:8080/winery/servicetemplates/`
                    }],
                    planLifecycleInterface: 'OpenTOSCA-Lifecycle-Interface',
                    planOperationInitiate: 'initiate',
                    planOperationTerminate: 'terminate',
                },
                repository: {
                    selectedRepository: {
                        name: 'OpenTOSCA',
                        url: `http://192.168.99.100:8080/winery/servicetemplates/`
                    }
                },
            },
            [createLogger()],
            storeEnhancers,
        );
        // Enable syncing of Angular router state with our Redux store.
        ngReduxRouter.initialize();
    }
}
