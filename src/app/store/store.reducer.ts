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

import { combineReducers } from 'redux';
import { composeReducers, defaultFormReducer } from '@angular-redux/form';
import { routerReducer } from '@angular-redux/router';
import { applicationManagementReducer } from '../application-management/application-management.reducer';
import { configurationReducer } from '../configuration/configuration.reducer';
import { repositoryManagementReducer } from '../repository-management/repository-management.reducer';
import { breadcrumbReducer } from 'app/core/component/breadcrumb/breadcrumb.reducer';
import { growlReducer } from '../core/growl/growl.reducer';

export const rootReducer = composeReducers(
    defaultFormReducer(),
    combineReducers({
        container: applicationManagementReducer,
        administration: configurationReducer,
        repository: repositoryManagementReducer,
        breadcrumb: breadcrumbReducer,
        growl: growlReducer,
        router: routerReducer,
    })
);
