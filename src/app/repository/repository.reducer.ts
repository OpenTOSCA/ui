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
import { RepositoryActions } from './repository-actions.service';
import { Item } from '../configuration/repository-configuration/repository-configuration.component';

export interface RepositoryState {
    selectedRepository: Item;
}

export const INITIAL_STATE: RepositoryState = {
    selectedRepository: null,
};

export function repositoryReducer(state: RepositoryState = INITIAL_STATE,
                                  action: Action): RepositoryState {
    switch (action.type) {
        case RepositoryActions.SELECTED_REPOSITORY:
            return Object.assign({}, state, {
                selectedRepository: action.payload
            });
        default:
            return state;
    }
}
