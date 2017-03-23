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
import { BreadcrumbEntry } from '../shared/model/breadcrumb.model';
import { MarketplaceApplication } from '../shared/model/marketplace-application.model';

export interface AppState {
    container?: {
        applications?: Array<Application>
    };
    repository?: {
        applications?: Array<MarketplaceApplication>
    };
    administration?: {
        containerAPI?: string,
        repositoryAPI?: string,
        buildPlanPath?: string
    };
    breadcrumb?: Array<BreadcrumbEntry>;
}

export const INITIAL_STATE: AppState = {
    container: {
        applications: []
    },
    repository: {
        applications: []
    },
    administration: {
        containerAPI: 'http://localhost:1337/containerapi',
        repositoryAPI: 'http://localhost:8080/winery/servicetemplates/',
        buildPlanPath: '/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/Operations/initiate/Plan'
    },
    breadcrumb: []
};
