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
import { Component, ViewEncapsulation } from '@angular/core';
import { select } from '@angular-redux/store';
import { MenuItem } from 'primeng/primeng';
import { Observable } from 'rxjs';

@Component({
    selector: 'opentosca-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class BreadcrumbComponent {

    @select(['breadcrumb', 'entries']) breadcrumbEntries: Observable<Array<MenuItem>>;

    constructor() {
    }
}
