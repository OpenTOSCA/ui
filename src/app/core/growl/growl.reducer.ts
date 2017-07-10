/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal
 */
import { Message } from 'primeng/primeng';
import { Action } from '../../store/store.action';
import { GrowlActions } from './growl-actions';
import * as _ from 'lodash';

export interface GrowlState {
    messages?: Array<Message>;
}

export const INITIAL_STATE: GrowlState = {
    messages: []
};

export function growlReducer(state: GrowlState = INITIAL_STATE,
                             action: Action): GrowlState {
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
