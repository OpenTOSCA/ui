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
import { Message } from 'primeng/primeng';
import { Action } from '../../store/store.action';
import { GrowlActions } from './growl-actions';

export interface GrowlState {
    messages?: Array<Message>;
}

export const INITIAL_STATE: GrowlState = {
    messages: []
};

export function growlReducer(state: GrowlState = INITIAL_STATE, action: Action): GrowlState {
    switch (action.type) {
        case GrowlActions.ADD_GROWL:
            const newState = Object.assign({}, state);
            newState.messages.push(action.payload);
            return newState;
        case GrowlActions.UPDATE_GROWLS:
            return Object.assign({}, state, {
                messages: action.payload
            });
        default:
            return state;
    }
}
