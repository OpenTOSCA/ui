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

export function rootReducer(state: IAppState = INITIAL_STATE, action: OpenTOSCAUiAction): IAppState {
    switch (action.type) {
        case OpenTOSCAUiActions.ADD_CONTAINER_APPLICATIONS:
            return {
                container: {
                    applications: _.concat(state.container.applications, action.payload)
                },
                repository: state.repository,
                administration: state.administration
            };
        case OpenTOSCAUiActions.ADD_REPOSITORY_APPLICATIONS:
            return {
                container: state.container,
                repository : {
                    applications: _.concat(state.repository.applications, action.payload)
                },
                administration: state.administration
            };
        case OpenTOSCAUiActions.REMOVE_REPOSITORY_APPLICATION:
            return {
                container: state.container,
                repository: {
                    applications: _.filter(state.repository.applications, function(a){return !(a.id === action.payload.id);})
                }
            };
        default:
            return state;
    }
}
