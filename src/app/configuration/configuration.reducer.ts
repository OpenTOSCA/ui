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
import { Item } from './repository-configuration/repository-configuration.component';

export interface ConfigurationState {
    containerUrl?: string;
    repositoryItems?: Array<Item>;
    planLifecycleInterface?: string;
    planOperationInitiate?: string;
    planOperationTerminate?: string;
}

export const INITIAL_STATE: ConfigurationState = {
    containerUrl: '',
    repositoryItems: [],
    planLifecycleInterface: 'OpenTOSCA-Lifecycle-Interface',
    planOperationInitiate: 'initiate',
    planOperationTerminate: 'terminate',
};

export function configurationReducer(state: ConfigurationState = INITIAL_STATE,
                                     action: Action): ConfigurationState {
    switch (action.type) {
        case ConfigurationActions.UPDATE_REPOSITORY_ITEMS:
            const items = <Array<Item>> action.payload;
            for (const item of items) {
                if (!item.url.endsWith('/')) {
                    item.url = item.url + '/';
                }
            }
            return Object.assign({}, state, {
                repositoryItems: items
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
