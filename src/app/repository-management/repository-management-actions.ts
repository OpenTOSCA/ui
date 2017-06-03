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
import { MarketplaceApplication } from '../core/model/marketplace-application.model';

@Injectable()
export class RepositoryManagementActions {
    static ADD_REPOSITORY_APPLICATIONS = 'ADD_REPOSITORY_APPLICATIONS';
    static REMOVE_REPOSITORY_APPLICATION = 'REMOVE_REPOSITORY_APPLICATION';
    static CLEAR_REPOSITORY_APPLICATIONS = 'CLEAR_REPOSITORY_APPLICATIONS';


    static addRepositoryApplications(apps: Array<MarketplaceApplication>): Action {
        return {
            type: RepositoryManagementActions.ADD_REPOSITORY_APPLICATIONS,
            payload: apps
        };
    }

    static clearRepositoryApplications(): Action {
        return {
            type: RepositoryManagementActions.CLEAR_REPOSITORY_APPLICATIONS,
            payload: null
        };
    }

    static removeRepositoryApplication(app: MarketplaceApplication): Action {
        return {
            type: RepositoryManagementActions.REMOVE_REPOSITORY_APPLICATION,
            payload: app
        };
    }
}
