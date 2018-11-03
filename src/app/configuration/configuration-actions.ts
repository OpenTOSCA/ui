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

@Injectable()
export class ConfigurationActions {
    static UPDATE_REPOSITORY_URL = 'UPDATE_REPOSITORY_URL';
    static UPDATE_CONTAINER_URL = 'UPDATE_CONTAINER_URL';
    static UPDATE_BUILDPLANPATH = 'UPDATE_BUILDPLANPATH';
    static UPDATE_TERMINATIONPLANPATH = 'UPDATE_TERMINATIONPLANPATH';

    static updateRepositoryURL(url: string): Action {
        return {
            type: ConfigurationActions.UPDATE_REPOSITORY_URL,
            payload: url
        };
    }

    static updateContainerURL(url: string): Action {
        return {
            type: ConfigurationActions.UPDATE_CONTAINER_URL,
            payload: url
        };
    }

    static updateBuildPlanPath(path: string): Action {
        return {
            type: ConfigurationActions.UPDATE_BUILDPLANPATH,
            payload: path
        };
    }

    static updateTerminationPlanPath(path: string): Action {
        return {
            type: ConfigurationActions.UPDATE_TERMINATIONPLANPATH,
            payload: path
        };
    }
}
