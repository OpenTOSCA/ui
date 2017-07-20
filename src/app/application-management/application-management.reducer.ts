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
import { PlanOperationMetaData } from '../core/model/planOperationMetaData.model';
import { Action } from '../store/store.action';
import { ApplicationManagementActions } from './application-management-actions';
import { Csar } from '../core/model/new-api/csar.model';
import { ServiceTemplateInstance } from '../core/model/new-api/service-template-instance.model';
import { Plan } from '../core/model/new-api/plan.model';

export interface ApplicationManagementState {
    applications?: Array<Csar>;
    currentApp?: Csar;
    currentAppInstances?: Array<ServiceTemplateInstance>;
    currentBuildPlan?: Plan;
}

export const INITIAL_STATE: ApplicationManagementState = {
    applications: [],
    currentApp: null,
    currentAppInstances: [],
    currentBuildPlan: null
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
                currentApp : action.payload
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
        case ApplicationManagementActions.UPDATE_CURRENT_BUILD_PLAN:
            return Object.assign({}, state, {
                currentBuildPlan: action.payload
            });
        default:
            return state;
    }
}
