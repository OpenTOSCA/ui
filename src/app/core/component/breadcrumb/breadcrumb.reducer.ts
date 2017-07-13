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
