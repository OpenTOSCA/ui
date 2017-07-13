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
import { Action } from '../../../store/store.action';
import { MenuItem } from 'primeng/primeng';

@Injectable()
export class BreadcrumbActions {
    static UPDATE_BREADCRUMB = 'UPDATE_BREADCRUMB';
    static APPEND_BREADCRUMB = 'APPEND_BREADCRUMB';


    static updateBreadcrumb(breadcrumbs: Array<MenuItem>): Action {
        return {
            type: BreadcrumbActions.UPDATE_BREADCRUMB,
            payload: breadcrumbs
        };
    }

    static appendBreadcrumb(breadcrumb: MenuItem): Action {
        return {
            type: BreadcrumbActions.APPEND_BREADCRUMB,
            payload: breadcrumb
        };
    }
}
