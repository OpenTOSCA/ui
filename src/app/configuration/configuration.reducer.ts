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

import { Action } from '../store/store.action';
import { ConfigurationActions } from './configuration-actions';

export interface ConfigurationState {
    containerUrl?: string;
    repositoryUrl?: string;
    planLifecycleInterface?: string;
    planOperationInitiate?: string;
    planOperationTerminate?: string;
}

export const INITIAL_STATE: ConfigurationState = {
    containerUrl: 'http://localhost:1337',
    repositoryUrl: 'http://localhost:8080/winery/servicetemplates',
    planLifecycleInterface: 'OpenTOSCA-Lifecycle-Interface',
    planOperationInitiate: 'initiate',
    planOperationTerminate: 'terminate',
};

export function configurationReducer(state: ConfigurationState = INITIAL_STATE,
                                     action: Action): ConfigurationState {
    switch (action.type) {
        case ConfigurationActions.UPDATE_REPOSITORY_URL:
            let url = action.payload;
            if (!url.endsWith('/')) {
                url = url + '/';
            }
            return Object.assign({}, state, {
                repositoryUrl: url
            });
        case ConfigurationActions.UPDATE_CONTAINER_URL:
            return Object.assign({}, state, {
                containerUrl: action.payload
            });
        case ConfigurationActions.UPDATE_PLAN_LIFECYCLE_INTERFACE_NAME:
            return Object.assign({}, state, {
                planLifecycleInterface: action.payload
            });
        case ConfigurationActions.UPDATE_PLAN_OPERATION_INITIATE_NAME:
            return Object.assign({}, state, {
                planOperationInitiate: action.payload
            });
        case ConfigurationActions.UPDATE_PLAN_OPERATION_TERMINATION_NAME:
            return Object.assign({}, state, {
                planOperationTerminate: action.payload
            });
        default:
            return state;
    }
}
