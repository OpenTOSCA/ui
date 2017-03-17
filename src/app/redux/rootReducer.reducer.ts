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

import { INITIAL_STATE, AppState } from './store';
import { OpenTOSCAUiAction, OpenTOSCAUiActions } from './actions';
import * as _ from 'lodash';

export function rootReducer(state: AppState = INITIAL_STATE, action: OpenTOSCAUiAction): AppState {
    let newState = _.cloneDeep(state);
    switch (action.type) {
        case OpenTOSCAUiActions.ADD_CONTAINER_APPLICATIONS:
            newState.container.applications = action.payload;
            return newState;
        case OpenTOSCAUiActions.ADD_REPOSITORY_APPLICATIONS:
            newState.repository.applications = action.payload;
            return newState;
        case OpenTOSCAUiActions.REMOVE_CONTAINER_APPLICATION:
            newState.container.applications = _.filter(newState.container.applications, function (a) {
                return !(a.id === action.payload.id);
            });
            return newState;
        case OpenTOSCAUiActions.CLEAR_CONTAINER_APPLICATIONS:
            newState.container.applications = [];
            return newState;
        case OpenTOSCAUiActions.REMOVE_REPOSITORY_APPLICATION:
            newState.repository.applications = _.filter(newState.repository.applications, function (a) {
                return !(a.id === action.payload.id);
            });
            return newState;
        case OpenTOSCAUiActions.CLEAR_REPOSITORY_APPLICATIONS:
            newState.repository.applications = [];
            return newState;
        case OpenTOSCAUiActions.UPDATE_REPOSITORY_URL:
            newState.administration.repositoryAPI = action.payload;
            return newState;
        case OpenTOSCAUiActions.UPDATE_CONTAINER_URL:
            newState.administration.containerAPI = action.payload;
            return newState;
        case OpenTOSCAUiActions.UPDATE_BUILDPLANPATH:
            newState.administration.buildPlanPath = action.payload;
            return newState;
        case OpenTOSCAUiActions.UPDATE_BREADCRUMB:
            newState.breadcrumb = action.payload;
            return newState;
        case OpenTOSCAUiActions.APPEND_BREADCRUMB:
            newState.breadcrumb.push(action.payload);
            return newState;
        default:
            return state;
    }
}
