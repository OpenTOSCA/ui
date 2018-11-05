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
