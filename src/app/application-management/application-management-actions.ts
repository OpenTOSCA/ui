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

import { Injectable } from '@angular/core';
import { Action } from '../store/store.action';
import { Csar } from '../core/model/csar.model';
import { ServiceTemplateInstance } from '../core/model/service-template-instance.model';
import { Plan } from '../core/model/plan.model';

@Injectable()
export class ApplicationManagementActions {
    static ADD_CONTAINER_APPLICATIONS = 'ADD_CONTAINER_APPLICATIONS';
    static REMOVE_CONTAINER_APPLICATION = 'REMOVE_CONTAINER_APPLICATION';
    static CLEAR_CONTAINER_APPLICATIONS = 'CLEAR_CONTAINER_APPLICATIONS';

    static UPDATE_CURRENT_APPLICATION = 'UPDATE_CURRENT_APPLICATION';
    static CLEAR_CURRENT_APPLICATION = 'CLEAR_CURRENT_APPLICATION';
    static UPDATE_APPLICATION_INSTANCES = 'UPDATE_APPLICATION_INSTANCES';
    static CLEAR_APPLICATION_INSTANCES = 'CLEAR_APPLICATION_INSTANCES';
    static UPDATE_APPLICATION_INSTANCE = 'UPDATE_APPLICATION_INSTANCE';
    static CLEAR_APPLICATION_INSTANCE = 'CLEAR_APPLICATION_INSTANCE';

    static UPDATE_CURRENT_BUILD_PLAN = 'UPDATE_CURRENT_BUILD_PLAN';
    static UPDATE_CURRENT_TERMINATION_PLAN = 'UPDATE_CURRENT_TERMINATION_PLAN';

    static addContainerApplications(apps: Array<Csar>): Action {
        return {
            type: ApplicationManagementActions.ADD_CONTAINER_APPLICATIONS,
            payload: apps
        };
    }

    static removeContainerApplication(app: Csar): Action {
        return {
            type: ApplicationManagementActions.REMOVE_CONTAINER_APPLICATION,
            payload: app
        };
    }

    static clearContainerApplication(): Action {
        return {
            type: ApplicationManagementActions.CLEAR_CONTAINER_APPLICATIONS,
            payload: null
        };
    }

    static updateCurrentApplication(app: Csar): Action {
        return {
            type: ApplicationManagementActions.UPDATE_CURRENT_APPLICATION,
            payload: app
        };
    }

    static clearCurrentApplication(): Action {
        return {
            type: ApplicationManagementActions.CLEAR_CURRENT_APPLICATION,
            payload: null
        };
    }

    static updateApplicationInstances(instances: Array<ServiceTemplateInstance>): Action {
        return {
            type: ApplicationManagementActions.UPDATE_APPLICATION_INSTANCES,
            payload: instances
        };
    }

    static updateApplicationInstance(instance: ServiceTemplateInstance): Action {
        return {
            type: ApplicationManagementActions.UPDATE_APPLICATION_INSTANCE,
            payload: instance
        };
    }

    static clearApplicationInstance(): Action {
        return {
            type: ApplicationManagementActions.CLEAR_APPLICATION_INSTANCE,
            payload: null
        };
    }

    static updateBuildPlan(plan: Plan): Action {
        return {
            type: ApplicationManagementActions.UPDATE_CURRENT_BUILD_PLAN,
            payload: plan
        };
    }

    static updateTerminationPlan(plan: Plan): Action {
        return {
            type: ApplicationManagementActions.UPDATE_CURRENT_TERMINATION_PLAN,
            payload: plan
        };
    }

    static clearApplicationInstances(): Action {
        return {
            type: ApplicationManagementActions.CLEAR_APPLICATION_INSTANCES,
            payload: null
        };
    }
}
