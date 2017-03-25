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
import { BreadcrumbEntry } from '../shared/model/breadcrumb.model';
import { BuildPlanOperationMetaData } from '../shared/model/buildPlanOperationMetaData.model';
import { ApplicationInstance } from '../shared/model/application-instance.model';

export interface OpenTOSCAUiAction {
    type: string;
    payload: any;
}

@Injectable()
export class OpenTOSCAUiActions {
    static ADD_CONTAINER_APPLICATIONS = 'ADD_APPLICATIONS';
    static REMOVE_CONTAINER_APPLICATION = 'REMOVE_APPLICATION';
    static CLEAR_CONTAINER_APPLICATIONS = 'CLEAR_CONTAINER_APPLICATIONS';

    static ADD_REPOSITORY_APPLICATIONS = 'ADD_REPOSITORY_APPLICATIONS';
    static REMOVE_REPOSITORY_APPLICATION = 'REMOVE_REPOSITORY_APPLICATION';
    static CLEAR_REPOSITORY_APPLICATIONS = 'CLEAR_REPOSITORY_APPLICATIONS';

    static UPDATE_CURRENT_APPLICATION = 'UPDATE_CURRENT_APPLICATION';
    static CLEAR_CURRENT_APPLICATION = 'CLEAR_CURRENT_APPLICATION';
    static ADD_APPLICATION_INSTANCES = 'ADD_APPLICATION_INSTANCES';
    static CLEAR_APPLICATION_INSTANCES = 'CLEAR_APPLICATION_INSTANCES';

    static UPDATE_CURRENT_BUILD_PLAN_OPERATION_META_DATA = 'UPDATE_CURRENT_BUILD_PLAN_OPERATION_META_DATA';

    static UPDATE_REPOSITORY_URL = 'UPDATE_REPOSITORY_URL';
    static UPDATE_CONTAINER_URL = 'UPDATE_CONTAINER_URL';
    static UPDATE_BUILDPLANPATH = 'UPDATE_BUILDPLANPATH';
    static UPDATE_TERMINATIONPLANPATH = 'UPDATE_TERMINATIONPLANPATH';

    static UPDATE_BREADCRUMB = 'UPDATE_BREADCRUMB';
    static APPEND_BREADCRUMB = 'APPEND_BREADCRUMB';

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

    static clearContainerApplication(): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.CLEAR_CONTAINER_APPLICATIONS,
            payload: null
        };
    }

    static addRepositoryApplications(apps: Array<MarketplaceApplication>): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.ADD_REPOSITORY_APPLICATIONS,
            payload: apps
        };
    }

    static clearRepositoryApplications(): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.CLEAR_REPOSITORY_APPLICATIONS,
            payload: null
        };
    }

    static removeRepositoryApplication(app: MarketplaceApplication): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.REMOVE_REPOSITORY_APPLICATION,
            payload: app
        };
    }

    static updateCurrentApplication(app: Application): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.UPDATE_CURRENT_APPLICATION,
            payload: app
        };
    }

    static clearCurrentApplication(): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.CLEAR_CURRENT_APPLICATION,
            payload: null
        };
    }

    static addApplicationInstances(instances: Array<ApplicationInstance>): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.ADD_APPLICATION_INSTANCES,
            payload: instances
        };
    }

    static updateBuildPlanOperationMetaData(metaData: BuildPlanOperationMetaData): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.UPDATE_CURRENT_BUILD_PLAN_OPERATION_META_DATA,
            payload: metaData
        };
    }

    static clearApplicationInstances(): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.CLEAR_APPLICATION_INSTANCES,
            payload: null
        };
    }

    static updateRepositoryURL(url: string): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.UPDATE_REPOSITORY_URL,
            payload: url
        };
    }

    static updateContainerURL(url: string): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.UPDATE_CONTAINER_URL,
            payload: url
        };
    }

    static updateBuildPlanPath(path: string): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.UPDATE_BUILDPLANPATH,
            payload: path
        };
    }

    static updateTerminationPlanPath(path: string): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.UPDATE_TERMINATIONPLANPATH,
            payload: path
        };
    }

    static updateBreadcrumb(breadcrumbs: Array<BreadcrumbEntry>): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.UPDATE_BREADCRUMB,
            payload: breadcrumbs
        };
    }

    static appendBreadcrumb(breadcrumb: BreadcrumbEntry): OpenTOSCAUiAction {
        return {
            type: OpenTOSCAUiActions.APPEND_BREADCRUMB,
            payload: breadcrumb
        };
    }
}
