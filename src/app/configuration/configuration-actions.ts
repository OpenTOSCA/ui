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
