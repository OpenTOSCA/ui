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

import { combineReducers } from 'redux';
import { composeReducers, defaultFormReducer } from '@angular-redux/form';
import { routerReducer } from '@angular-redux/router';
import { applicationManagementReducer } from '../application-management/application-management.reducer';
import { configurationReducer } from '../configuration/configuration.reducer';
import { repositoryReducer } from '../repository/repository.reducer';
import { breadcrumbReducer } from '../core/component/breadcrumb/breadcrumb.reducer';
import { growlReducer } from '../core/growl/growl.reducer';
import persistState from 'redux-localstorage';

import { TopologyRendererReducer } from '../topologyrenderer/topologyRenderer.reducer';
import { WineryReducer } from '../topologyrenderer/winery.reducer';

export const rootReducer = composeReducers(
    defaultFormReducer(),
    combineReducers({
        container: applicationManagementReducer,
        administration: configurationReducer,
        repository: repositoryReducer,
        breadcrumb: breadcrumbReducer,
        growl: growlReducer,
        router: routerReducer,
        topologyRendererState: TopologyRendererReducer,
        wineryState: WineryReducer
    })
);

export const rootEnhancers = [
    persistState(['administration', 'repository'], { key: 'opentosca' })
];
