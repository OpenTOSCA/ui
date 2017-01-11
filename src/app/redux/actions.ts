/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal
 */

import { Application } from '../shared/model/application.model';
import { Injectable } from '@angular/core';
import { MarketplaceApplication } from '../shared/model/marketplace-application.model';

export interface OpenTOSCAUiAction {
    type: string;
    payload: any;
}

@Injectable()
export class OpenTOSCAUiActions {
    static ADD_CONTAINER_APPLICATIONS = 'ADD_APPLICATIONS';
    static REMOVE_CONTAINER_APPLICATION = 'REMOVE_APPLICATION';

    static ADD_REPOSITORY_APPLICATIONS = 'ADD_REPOSITORY_APPLICATIONS';
    static REMOVE_REPOSITORY_APPLICATION = 'REMOVE_REPOSITORY_APPLICATION';

    static addContainerApplications(apps: Array<Application>): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.ADD_CONTAINER_APPLICATIONS,
            payload: apps
        };
    }

    static removeContainerApplication(app: Application): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.REMOVE_CONTAINER_APPLICATION,
            payload: app
        };
    }

    static addRepositoryApplications(apps: Array<MarketplaceApplication>): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.ADD_REPOSITORY_APPLICATIONS,
            payload: apps
        };
    }

    static removeRepositoryApplication(app: MarketplaceApplication): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.REMOVE_REPOSITORY_APPLICATION,
            payload: app
        };
    }
}
