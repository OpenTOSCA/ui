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

import { BreadcrumbActions } from './breadcrumb-actions';
import { Action } from '../../../store/store.action';
import { MenuItem } from 'primeng/primeng';

export interface BreadcrumbState {
    entries?: Array<MenuItem>;
}

export const INITIAL_STATE: BreadcrumbState = {
    entries: []
};

export function breadcrumbReducer(state: BreadcrumbState = INITIAL_STATE,
                                  action: Action): BreadcrumbState {
    switch (action.type) {

        case BreadcrumbActions.UPDATE_BREADCRUMB:
            return Object.assign({}, state, {
                entries: action.payload
            });
        case BreadcrumbActions.APPEND_BREADCRUMB:
            const newArray = state.entries.slice();
            newArray.push(action.payload);
            return Object.assign({}, state, {
                entries: newArray
            });
        default:
            return state;
    }
}
