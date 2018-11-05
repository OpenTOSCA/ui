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
import { MarketplaceApplication } from '../core/model/marketplace-application.model';

@Injectable()
export class RepositoryActions {

    static ADD_REPOSITORY_APPLICATIONS = 'ADD_REPOSITORY_APPLICATIONS';
    static REMOVE_REPOSITORY_APPLICATION = 'REMOVE_REPOSITORY_APPLICATION';
    static CLEAR_REPOSITORY_APPLICATIONS = 'CLEAR_REPOSITORY_APPLICATIONS';

    static addRepositoryApplications(apps: Array<MarketplaceApplication>): Action {
        return {
            type: RepositoryActions.ADD_REPOSITORY_APPLICATIONS,
            payload: apps
        };
    }

    static clearRepositoryApplications(): Action {
        return {
            type: RepositoryActions.CLEAR_REPOSITORY_APPLICATIONS,
            payload: null
        };
    }

    static removeRepositoryApplication(app: MarketplaceApplication): Action {
        return {
            type: RepositoryActions.REMOVE_REPOSITORY_APPLICATION,
            payload: app
        };
    }
}
