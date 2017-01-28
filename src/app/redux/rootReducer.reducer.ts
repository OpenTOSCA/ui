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

import { INITIAL_STATE, IAppState } from './store';
import { OpenTOSCAUiAction, OpenTOSCAUiActions } from './actions';
import * as _ from 'lodash';
import { MarketplaceApplication } from '../shared/model/marketplace-application.model';
import { Application } from '../shared/model/application.model';

export function rootReducer(state: IAppState = INITIAL_STATE, action: OpenTOSCAUiAction): IAppState {
    switch (action.type) {
        case OpenTOSCAUiActions.ADD_CONTAINER_APPLICATIONS:
            return {
                container: {
                    applications: addContainerApplications(state.container.applications, action.payload)
                },
                repository: state.repository,
                administration: state.administration
            };
        case OpenTOSCAUiActions.ADD_REPOSITORY_APPLICATIONS:
            return {
                container: state.container,
                repository : {
                    applications: addRepositoryApplications(state.repository.applications, action.payload)
                },
                administration: state.administration
            };
        case OpenTOSCAUiActions.REMOVE_CONTAINER_APPLICATION:
            return {
                container: {
                    applications: _.filter(state.container.applications, function(a){return !(a.id === action.payload.id); })
                },
                repository: state.repository,
                administration: state.administration
            };
        case OpenTOSCAUiActions.CLEAR_CONTAINER_APPLICATIONS:
            return {
                container: {
                    applications: []
                },
                repository: state.repository,
                administration: state.administration
            };
        case OpenTOSCAUiActions.REMOVE_REPOSITORY_APPLICATION:
            return {
                container: state.container,
                repository: {
                    applications: _.filter(state.repository.applications, function(a){return !(a.id === action.payload.id); })
                },
                administration: state.administration
            };
        case OpenTOSCAUiActions.CLEAR_REPOSITORY_APPLICATIONS:
            return {
                container: state.container,
                repository: {
                    applications: []
                },
                administration: state.administration
            };
        case OpenTOSCAUiActions.UPDATE_REPOSITORY_URL:
            return {
                container: state.container,
                repository: state.repository,
                administration: {
                    containerAPI: state.administration.containerAPI,
                    repositoryAPI: action.payload,
                    buildPlanPath: state.administration.buildPlanPath
                }
            };
        case OpenTOSCAUiActions.UPDATE_CONTAINER_URL:
            return {
                container: state.container,
                repository: state.repository,
                administration: {
                    containerAPI: action.payload,
                    repositoryAPI: state.administration.repositoryAPI,
                    buildPlanPath: state.administration.buildPlanPath
                }
            };
        case OpenTOSCAUiActions.UPDATE_BUILDPLANPATH:
            return {
                container: state.container,
                repository: state.repository,
                administration: {
                    containerAPI: state.administration.containerAPI,
                    repositoryAPI: state.administration.repositoryAPI,
                    buildPlanPath: action.payload
                }
            };
        default:
            return state;
    }
}

/**
 * Function ensured redux style for repository.applications by cloning state array and then pushing apps to it or updates them if already present
 * @param oldApps
 * @param appsToAdd
 * @returns {MarketplaceApplication[]}
 */
function addRepositoryApplications(oldApps: Array<MarketplaceApplication>, appsToAdd: Array<MarketplaceApplication>): Array<MarketplaceApplication> {
    // Clone the old state and then let it untouched
    let newApps = _.concat(oldApps, []);

    for (let app of appsToAdd){
        let i = _.findIndex(newApps, {'id': app.id});
        if (i >= 0) {
            // todo: check if angular updates changes if app is already in applications repository array
            newApps[i] = app;
        } else {
            newApps.push(app);
        }
    }
    return newApps;
}

/**
 * Function ensured redux style for container.applications by cloning state array and then pushing apps to it or updates them if already present
 * @param oldApps
 * @param appsToAdd
 * @returns {MarketplaceApplication[]}
 */
function addContainerApplications(oldApps: Array<Application>, appsToAdd: Array<Application>): Array<Application> {
    // Clone the old state and then let it untouched
    let newApps = _.concat(oldApps, []);

    for (let app of appsToAdd){
        let i = _.findIndex(newApps, {'id': app.id});
        if (i >= 0) {
            // todo: check if angular updates changes if app is already in applications container array
            newApps[i] = app;
        } else {
            newApps.push(app);
        }
    }
    return newApps;
}
