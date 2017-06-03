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

import * as _ from 'lodash';
import { Action } from '../store/store.action';
import { MarketplaceApplication } from '../core/model/marketplace-application.model';
import { RepositoryManagementActions } from './repository-management-actions';

export interface RepositoryManagementState {
    applications?: Array<MarketplaceApplication>;
}

export const INITIAL_STATE: RepositoryManagementState = {
    applications: []
};

export function repositoryManagementReducer(state: RepositoryManagementState = INITIAL_STATE,
                                             action: Action): RepositoryManagementState {
    switch (action.type) {

        case RepositoryManagementActions.ADD_REPOSITORY_APPLICATIONS:
            return Object.assign({}, state, {
                applications: action.payload
            });
        case RepositoryManagementActions.REMOVE_REPOSITORY_APPLICATION:
            return Object.assign({}, state, {
                applications: _.filter(state.applications, function (a) {
                    return !(a.id === action.payload.id);
                })
            });
        case RepositoryManagementActions.CLEAR_REPOSITORY_APPLICATIONS:
            return Object.assign({}, state, {
                applications: []
            });
        default:
            return state;
    }
}
