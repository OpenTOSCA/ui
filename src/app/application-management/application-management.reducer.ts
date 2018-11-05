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
import { ApplicationManagementActions } from './application-management-actions';
import { Csar } from '../core/model/csar.model';
import { ServiceTemplateInstance } from '../core/model/service-template-instance.model';
import { Plan } from '../core/model/plan.model';

export interface ApplicationManagementState {
    applications?: Array<Csar>;
    currentApp?: Csar;
    currentAppInstances?: Array<ServiceTemplateInstance>;
    currentInstance?: ServiceTemplateInstance;
    currentBuildPlan?: Plan;
    currentTerminationPlan?: Plan;
}

export const INITIAL_STATE: ApplicationManagementState = {
    applications: [],
    currentApp: null,
    currentAppInstances: [],
    currentInstance: null,
    currentBuildPlan: null,
    currentTerminationPlan: null
};

export function applicationManagementReducer(state: ApplicationManagementState = INITIAL_STATE,
                                             action: Action): ApplicationManagementState {
    switch (action.type) {
        case ApplicationManagementActions.ADD_CONTAINER_APPLICATIONS:
            return Object.assign({}, state, {
                applications: action.payload
            });
        case ApplicationManagementActions.REMOVE_CONTAINER_APPLICATION:
            return Object.assign({}, state, {
                // Todo can we do this without lodash?
                applications: _.filter(state.applications, function (a) {
                    return !(a.id === action.payload.id);
                })
            });
        case ApplicationManagementActions.CLEAR_CONTAINER_APPLICATIONS:
            return Object.assign({}, state, {
                applications: []
            });
        case ApplicationManagementActions.UPDATE_CURRENT_APPLICATION:
            return Object.assign({}, state, {
                currentApp: action.payload
            });
        case ApplicationManagementActions.CLEAR_CURRENT_APPLICATION:
            return Object.assign({}, state, {
                currentApp: null
            });
        case ApplicationManagementActions.UPDATE_APPLICATION_INSTANCES:
            return Object.assign({}, state, {
                currentAppInstances: action.payload
            });
        case ApplicationManagementActions.CLEAR_APPLICATION_INSTANCES:
            return Object.assign({}, state, {
                currentAppInstances: []
            });
        case ApplicationManagementActions.UPDATE_APPLICATION_INSTANCE:
            return Object.assign({}, state, {
                currentInstance: action.payload
            });
        case ApplicationManagementActions.CLEAR_APPLICATION_INSTANCE:
            return Object.assign({}, state, {
                currentInstance: null
            });
        case ApplicationManagementActions.UPDATE_CURRENT_BUILD_PLAN:
            return Object.assign({}, state, {
                currentBuildPlan: action.payload
            });
        case ApplicationManagementActions.UPDATE_CURRENT_TERMINATION_PLAN:
            return Object.assign({}, state, {
                currentTerminationPlan: action.payload
            });
        default:
            return state;
    }
}
