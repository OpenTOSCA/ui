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
