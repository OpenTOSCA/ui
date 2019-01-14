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
import { Injectable } from '@angular/core';

@Injectable()
export class GrowlActions {

    static ADD_GROWL = 'ADD_GROWL';
    static UPDATE_GROWLS = 'UPDATE_GROWLS';

    static addGrowl(message: Message): Action {
        return {
            type: GrowlActions.ADD_GROWL,
            payload: message
        };
    }

    static updateGrowls(messages: Array<Message>): Action {
        return {
            type: GrowlActions.UPDATE_GROWLS,
            payload: messages
        };
    }
}
