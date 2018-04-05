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

import { Action } from '../store/store.action';
import { ConfigurationActions } from './configuration-actions';

export interface ConfigurationState {
    containerAPI?: string;
    repositoryAPI?: string;
    buildPlanPath?: string;
    terminationPlanPath?: string;
    opentoscaLifecycleInterfaceName?: string;
    initiationOperationName?: string;
    terminationOperationName?: string;
}

export const INITIAL_STATE: ConfigurationState = {
    containerAPI: 'http://localhost:1337',
    repositoryAPI: 'http://localhost:8080/#/servicetemplates/',
    buildPlanPath: '/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/Operations/initiate/Plan',
    terminationPlanPath: '/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/Operations/terminate/Plan',
    opentoscaLifecycleInterfaceName: 'OpenTOSCA-Lifecycle-Interface',
    initiationOperationName: 'initiate',
    terminationOperationName: 'terminate'
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
                repositoryAPI: url
            });
        case ConfigurationActions.UPDATE_CONTAINER_URL:
            return Object.assign({}, state, {
                containerAPI: action.payload
            });
        case ConfigurationActions.UPDATE_TERMINATIONPLANPATH:
            return Object.assign({}, state, {
                terminationPlanPath: action.payload
            });
        case ConfigurationActions.UPDATE_BUILDPLANPATH:
            return Object.assign({}, state, {
                buildPlanPath: action.payload
            });
        default:
            return state;
    }
}
