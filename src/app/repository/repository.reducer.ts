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
import * as _ from 'lodash';
import { Action } from '../store/store.action';
import { MarketplaceApplication } from '../core/model/marketplace-application.model';
import { RepositoryActions } from './repository-actions.service';

export interface RepositoryState {
    applications?: Array<MarketplaceApplication>;
}

export const INITIAL_STATE: RepositoryState = {
    applications: []
};

export function repositoryReducer(state: RepositoryState = INITIAL_STATE,
                                  action: Action): RepositoryState {
    switch (action.type) {
        case RepositoryActions.ADD_REPOSITORY_APPLICATIONS:
            return Object.assign({}, state, {
                applications: action.payload
            });
        case RepositoryActions.REMOVE_REPOSITORY_APPLICATION:
            return Object.assign({}, state, {
                applications: _.filter(state.applications, function (a) {
                    return !(a.id === action.payload.id);
                })
            });
        case RepositoryActions.CLEAR_REPOSITORY_APPLICATIONS:
            return Object.assign({}, state, {
                applications: []
            });
        default:
            return state;
    }
}