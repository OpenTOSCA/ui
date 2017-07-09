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

import { Injectable } from '@angular/core';
import { PlanOperationMetaData } from '../core/model/planOperationMetaData.model';
import { Action } from '../store/store.action';
import { Csar } from '../core/model/new-api/csar.model';
import { ServiceTemplateInstance } from '../core/model/new-api/service-template-instance.model';

@Injectable()
export class ApplicationManagementActions {
    static ADD_CONTAINER_APPLICATIONS = 'ADD_CONTAINER_APPLICATIONS';
    static REMOVE_CONTAINER_APPLICATION = 'REMOVE_CONTAINER_APPLICATION';
    static CLEAR_CONTAINER_APPLICATIONS = 'CLEAR_CONTAINER_APPLICATIONS';

    static UPDATE_CURRENT_APPLICATION = 'UPDATE_CURRENT_APPLICATION';
    static CLEAR_CURRENT_APPLICATION = 'CLEAR_CURRENT_APPLICATION';
    static UPDATE_APPLICATION_INSTANCES = 'UPDATE_APPLICATION_INSTANCES';
    static CLEAR_APPLICATION_INSTANCES = 'CLEAR_APPLICATION_INSTANCES';

    static UPDATE_CURRENT_BUILD_PLAN_OPERATION_META_DATA = 'UPDATE_CURRENT_BUILD_PLAN_OPERATION_META_DATA';

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

    static updateBuildPlanOperationMetaData(metaData: PlanOperationMetaData): Action {
        return {
            type: ApplicationManagementActions.UPDATE_CURRENT_BUILD_PLAN_OPERATION_META_DATA,
            payload: metaData
        };
    }

    static clearApplicationInstances(): Action {
        return {
            type: ApplicationManagementActions.CLEAR_APPLICATION_INSTANCES,
            payload: null
        };
    }
}
