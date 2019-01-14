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
import { Item } from './repository-configuration/repository-configuration.component';

@Injectable()
export class ConfigurationActions {

    static UPDATE_REPOSITORY_ITEMS = 'UPDATE_REPOSITORY_ITEMS';
    static UPDATE_CONTAINER_URL = 'UPDATE_CONTAINER_URL';
    static UPDATE_PLAN_LIFECYCLE_INTERFACE_NAME = 'UPDATE_PLAN_LIFECYCLE_INTERFACE_NAME';
    static UPDATE_PLAN_OPERATION_INITIATE_NAME = 'UPDATE_PLAN_OPERATION_INITIATE_NAME';
    static UPDATE_PLAN_OPERATION_TERMINATION_NAME = 'UPDATE_PLAN_OPERATION_TERMINATION_NAME';

    static updateRepositoryItems(items: Array<Item>): Action {
        return {
            type: ConfigurationActions.UPDATE_REPOSITORY_ITEMS,
            payload: items
        };
    }

    static updateContainerUrl(url: string): Action {
        return {
            type: ConfigurationActions.UPDATE_CONTAINER_URL,
            payload: url
        };
    }

    static updatePlanLifecycleInterface(name: string): Action {
        return {
            type: ConfigurationActions.UPDATE_PLAN_LIFECYCLE_INTERFACE_NAME,
            payload: name
        };
    }

    static updatePlanOperationInitiate(name: string): Action {
        return {
            type: ConfigurationActions.UPDATE_PLAN_OPERATION_INITIATE_NAME,
            payload: name
        };
    }

    static updatePlanOperationTerminate(name: string): Action {
        return {
            type: ConfigurationActions.UPDATE_PLAN_OPERATION_TERMINATION_NAME,
            payload: name
        };
    }
}
