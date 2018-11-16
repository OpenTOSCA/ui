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
import { ApplicationManagementActions } from './application-management-actions';
import { Csar } from '../core/model/csar.model';
import { Plan } from '../core/model/plan.model';
import { ServiceTemplateInstance } from '../core/model/service-template-instance.model';

export interface ApplicationManagementState {
    applications?: Array<Csar>;
    application?: {
        csar?: Csar;
        buildPlan?: Plan;
        terminationPlan?: Plan;
        instances: Map<string, ServiceTemplateInstance>;
    };
}

export const INITIAL_STATE: ApplicationManagementState = {
    applications: [],
    application: {
        csar: null,
        buildPlan: null,
        terminationPlan: null,
        instances: new Map<string, ServiceTemplateInstance>()
    },
    // currentApp: null,
    // currentAppInstances: [],
    // currentInstance: null,
    // buildPlan: null,
    // currentTerminationPlan: null
};

export function applicationManagementReducer(state: ApplicationManagementState = INITIAL_STATE,
                                             action: Action): ApplicationManagementState {
    switch (action.type) {
        case ApplicationManagementActions.CLEAR_APPLICATIONS:
            return Object.assign({}, state, {
                applications: []
            });
        case ApplicationManagementActions.UPDATE_APPLICATIONS:
            return Object.assign({}, state, {
                applications: action.payload
            });
        case ApplicationManagementActions.UPDATE_APPLICATION_CSAR:
            return Object.assign({}, state, {
                application: {
                    ...state.application, csar: action.payload
                }
            });
        case ApplicationManagementActions.UPDATE_APPLICATION_BUILDPLAN:
            return Object.assign({}, state, {
                application: {
                    ...state.application, buildPlan: action.payload
                }
            });
        case ApplicationManagementActions.UPDATE_APPLICATION_TERMINATIONPLAN:
            return Object.assign({}, state, {
                application: {
                    ...state.application, terminationPlan: action.payload
                }
            });
        case ApplicationManagementActions.UPDATE_APPLICATION_INSTANCES:
            return Object.assign({}, state, {
                application: {
                    ...state.application, instances: action.payload
                }
            });
        case ApplicationManagementActions.CLEAR_APPLICATION_INSTANCES:
            return Object.assign({}, state, {
                application: {
                    ...state.application, instances: []
                }
            });
        default:
            return state;
    }
}
