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
import { Plan } from '../core/model/plan.model';
import { ServiceTemplateInstance } from '../core/model/service-template-instance.model';
import { Interface } from '../core/model/interface.model';

@Injectable()
export class ApplicationManagementActions {

    static UPDATE_APPLICATIONS = 'UPDATE_APPLICATIONS';
    static CLEAR_APPLICATIONS = 'CLEAR_APPLICATIONS';

    static UPDATE_APPLICATION_CSAR = 'UPDATE_APPLICATION_CSAR';
    static CLEAR_APPLICATION_CSAR = 'CLEAR_APPLICATION_CSAR';
    static UPDATE_APPLICATION_INSTANCES = 'UPDATE_APPLICATION_INSTANCES';
    static CLEAR_APPLICATION_INSTANCES = 'CLEAR_APPLICATION_INSTANCES';
    static UPDATE_APPLICATION_INSTANCE = 'UPDATE_APPLICATION_INSTANCE';
    static CLEAR_APPLICATION_INSTANCE = 'CLEAR_APPLICATION_INSTANCE';
    static UPDATE_APPLICATION_BUILDPLAN = 'UPDATE_APPLICATION_BUILDPLAN';
    static UPDATE_APPLICATION_TERMINATIONPLAN = 'UPDATE_APPLICATION_TERMINATIONPLAN';
    static UPDATE_APPLICATION_INTERFACES ='UPDATE_APPLICATION_INTERFACES';
    static CLEAR_APPLICATION_INTERFACES ='CLEAR_APPLICATION_INTERFACES';

    static updateApplications(csars: Array<Csar>): Action {
        return {
            type: ApplicationManagementActions.UPDATE_APPLICATIONS,
            payload: csars
        };
    }

    static clearApplications(): Action {
        return { type: ApplicationManagementActions.CLEAR_APPLICATIONS };
    }

    static updateApplicationCsar(csar: Csar): Action {
        return {
            type: ApplicationManagementActions.UPDATE_APPLICATION_CSAR,
            payload: csar
        };
    }

    static clearApplicationCsar(): Action {
        return { type: ApplicationManagementActions.CLEAR_APPLICATION_CSAR };
    }

    static updateApplicationInstances(instances: Map<string, ServiceTemplateInstance>): Action {
        return {
            type: ApplicationManagementActions.UPDATE_APPLICATION_INSTANCES,
            payload: instances
        };
    }

    static clearApplicationInstances(): Action {
        return {
            type: ApplicationManagementActions.CLEAR_APPLICATION_INSTANCES,
            payload: null
        };
    }

    static updateBuildPlan(plan: Plan): Action {
        return {
            type: ApplicationManagementActions.UPDATE_APPLICATION_BUILDPLAN,
            payload: plan
        };
    }

    static updateTerminationPlan(plan: Plan): Action {
        return {
            type: ApplicationManagementActions.UPDATE_APPLICATION_TERMINATIONPLAN,
            payload: plan
        };
    }

    static updateInterfaces(ifaces: Interface[]): Action {
        return {
            type: ApplicationManagementActions.UPDATE_APPLICATION_INTERFACES,
            payload: ifaces
        }
    }

    static clearInterfaces(): Action {
        return {
            type: ApplicationManagementActions.CLEAR_APPLICATION_INTERFACES
        }
    }
}
